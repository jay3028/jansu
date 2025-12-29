'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function WorkerOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  const [formData, setFormData] = useState({
    category: 'delivery_worker',
    full_name: '',
    mobile: '',
    address_current: '',
    city: '',
    state: '',
    pincode: '',
    selfie_url: '',
    selfie_data: '', // Base64 image data
    aadhaar_reference: '',
    bank_affiliation: '',
    bc_affiliation: '',
    aeps_operator_id: '',
    service_region: '',
    aeps_device_info: '',
    transaction_role: '',
    consent_given: false,
    declaration_signed: false,
    device_fingerprint: ''
  });

  useEffect(() => {
    // Only check onboarding status, don't force redirect
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await api.get('/workers/onboarding/status');
      if (response.completed) {
        // User already completed onboarding
        // Don't force redirect, just notify
        console.log('Onboarding already completed');
      } else if (response.current_step > 0) {
        setCurrentStep(response.current_step);
        if (response.data) {
          setFormData(prev => ({ ...prev, ...response.data }));
        }
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user makes changes
  };

  // Camera functions for selfie capture
  const startCamera = async () => {
    try {
      setError('');
      setLoading(true);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.');
        setLoading(false);
        return;
      }

      // Show camera UI first so video element gets rendered
      setShowCamera(true);
      
      // Wait for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log('Requesting camera access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false 
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded');
          try {
            await videoRef.current?.play();
            console.log('Video playing');
            setIsCameraReady(true);
            setLoading(false);
          } catch (playErr) {
            console.error('Video play error:', playErr);
            setError('Failed to start video playback: ' + playErr.message);
            setShowCamera(false);
            setLoading(false);
          }
        };
      } else {
        console.error('Video ref is still null after waiting');
        setError('Video element not ready. Please refresh and try again.');
        setShowCamera(false);
        setLoading(false);
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Please allow camera access when prompted by your browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application. Please close other apps using the camera.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints not supported. Trying with default settings...';
        // Retry with simpler constraints
        try {
          setShowCamera(true);
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream;
            streamRef.current = simpleStream;
            videoRef.current.onloadedmetadata = async () => {
              try {
                await videoRef.current?.play();
                setIsCameraReady(true);
              } catch (e) {
                console.error('Play error in retry:', e);
              }
            };
          }
          setLoading(false);
          return;
        } catch (retryErr) {
          errorMessage += ' Retry failed: ' + retryErr.message;
        }
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
    setIsCameraReady(false);
    setError('');
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Wait for video to be ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        setError('Video not ready. Please wait a moment and try again.');
        return;
      }
      
      // Set canvas dimensions to match video (or use default if not available)
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get base64 image data
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      
      // Verify image was captured (should not be blank)
      if (imageData && imageData.length > 1000) {
        // Store the captured image
        handleChange('selfie_data', imageData);
        handleChange('selfie_url', 'captured');
        
        // Stop camera
        stopCamera();
      } else {
        setError('Failed to capture image. Please try again.');
      }
    } else {
      setError('Camera not initialized properly. Please restart camera.');
    }
  };

  const handleNext = async () => {
    // Double-check validation before proceeding
    if (!isStepValid()) {
      setError('Please fill in all required fields before proceeding');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      let stepData;
      
      switch (currentStep) {
        case 1:
          stepData = {
            category: formData.category,
            full_name: formData.full_name,
            mobile: formData.mobile
          };
          await api.post('/workers/onboard/step1', stepData);
          break;
          
        case 2:
          stepData = {
            address_current: formData.address_current,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          };
          await api.post('/workers/onboard/step2', stepData);
          break;
          
        case 3:
          stepData = { 
            selfie_url: formData.selfie_data // Send base64 data
          };
          await api.post('/workers/onboard/step3', stepData);
          break;
          
        case 4:
          stepData = { aadhaar_reference: formData.aadhaar_reference };
          await api.post('/workers/onboard/step4', stepData);
          break;
          
        case 5:
          // Only for AePS agents
          if (formData.category === 'aeps_agent') {
            stepData = {
              bank_affiliation: formData.bank_affiliation,
              bc_affiliation: formData.bc_affiliation,
              aeps_operator_id: formData.aeps_operator_id,
              service_region: formData.service_region,
              aeps_device_info: formData.aeps_device_info,
              transaction_role: formData.transaction_role
            };
            await api.post('/workers/onboard/step5', stepData);
          }
          break;
          
        case 6:
          stepData = {
            consent_given: formData.consent_given,
            declaration_signed: formData.declaration_signed,
            device_fingerprint: navigator.userAgent
          };
          await api.post('/workers/onboard/complete', stepData);
          
          // Onboarding complete, redirect to dashboard
          alert('Onboarding completed successfully!');
          router.push('/dashboard/worker');
          return;
      }
      
      // Move to next step
      if (formData.category === 'aeps_agent' && currentStep === 4) {
        setCurrentStep(5); // Go to AePS step
      } else if (formData.category !== 'aeps_agent' && currentStep === 4) {
        setCurrentStep(6); // Skip AePS step, go to consent
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } catch (err) {
      setError(err.message || 'Failed to save step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Handle back navigation for AePS agents
      if (formData.category !== 'aeps_agent' && currentStep === 6) {
        setCurrentStep(4); // Skip AePS step when going back
      } else if (formData.category === 'aeps_agent' && currentStep === 6) {
        setCurrentStep(5); // Go back to AePS step
      } else {
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  const totalSteps = formData.category === 'aeps_agent' ? 6 : 5;
  const displayStep = formData.category === 'aeps_agent' ? currentStep : (currentStep > 4 ? currentStep : currentStep);

  // Validation function for each step
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.full_name.trim() !== '' && formData.mobile.trim() !== '';
      case 2:
        return formData.address_current.trim() !== '' && 
               formData.city.trim() !== '' && 
               formData.state.trim() !== '' && 
               formData.pincode.length === 6;
      case 3:
        return formData.selfie_data !== '';
      case 4:
        return formData.aadhaar_reference.length === 12;
      case 5:
        if (formData.category === 'aeps_agent') {
          return formData.bank_affiliation.trim() !== '' && 
                 formData.bc_affiliation.trim() !== '' && 
                 formData.aeps_operator_id.trim() !== '';
        }
        return true; // Skip this step for non-AePS agents
      case 6:
        return formData.consent_given && formData.declaration_signed;
      default:
        return false;
    }
  };

  const canProceed = isStepValid();

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} user={user} />
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      {/* Header */}
      <div className="relative z-10 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-400">// WORKER_ONBOARDING</h1>
            <p className="text-xs text-gray-400 mt-1">SECURE IDENTITY REGISTRATION PROTOCOL</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">STEP {displayStep} / {totalSteps}</div>
            <div className="text-xs text-green-400 mt-1">
              {Math.round((displayStep / totalSteps) * 100)}% COMPLETE
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-6">
        <div className="h-2 bg-gray-900 rounded-full overflow-hidden border border-green-500/30">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            style={{ width: `${(displayStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded p-4">
              <p className="text-red-400 text-sm">✗ {error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-green-400 mb-2">STEP 1: BASIC INFORMATION</h2>
                <p className="text-gray-400 text-sm">ENTER YOUR PRIMARY IDENTIFICATION DATA</p>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Worker Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                >
                  <option value="delivery_worker">DELIVERY WORKER</option>
                  <option value="worker">GENERAL WORKER</option>
                  <option value="aeps_agent">AePS AGENT</option>
                </select>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="JOHN DOE"
                />
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-green-400 mb-2">STEP 2: ADDRESS DETAILS</h2>
                <p className="text-gray-400 text-sm">PROVIDE YOUR CURRENT LOCATION DATA</p>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Current Address *
                </label>
                <textarea
                  required
                  value={formData.address_current}
                  onChange={(e) => handleChange('address_current', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  rows={3}
                  placeholder="STREET ADDRESS, LOCALITY"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    placeholder="CITY NAME"
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    placeholder="STATE NAME"
                  />
                </div>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            </div>
          )}

          {/* Step 3: Selfie */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-green-400 mb-2">STEP 3: BIOMETRIC CAPTURE</h2>
                <p className="text-gray-400 text-sm">FACIAL RECOGNITION DATA ACQUISITION</p>
              </div>

              <div className="border-2 border-green-500/50 rounded-lg p-8 text-center">
                {!formData.selfie_data ? (
                  <>
                    {!showCamera ? (
                      <>
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-green-900/20 border-2 border-green-500/50 flex items-center justify-center">
                          <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-400 mb-4">CLICK TO CAPTURE LIVE SELFIE</p>
                        <p className="text-xs text-gray-500 mb-6">
                          → Live camera capture required for verification
                        </p>
                        <button
                          type="button"
                          onClick={startCamera}
                          disabled={loading}
                          className="bg-green-600 text-black font-bold py-3 px-6 rounded uppercase tracking-wider hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50"
                        >
                          {loading ? '⟳ STARTING CAMERA...' : '📸 START CAMERA'}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full max-w-md mx-auto rounded-lg border-2 border-green-500/50 bg-black"
                            style={{ transform: 'scaleX(-1)' }}
                          />
                          {!isCameraReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-green-400 text-lg animate-pulse rounded-lg">
                              ⟳ INITIALIZING CAMERA...
                            </div>
                          )}
                          <p className="text-xs text-gray-400 mt-2 text-center">
                            {isCameraReady ? '→ POSITION YOUR FACE IN THE FRAME' : '→ PLEASE WAIT...'}
                          </p>
                        </div>
                        <div className="flex gap-4 justify-center">
                          <button
                            type="button"
                            onClick={captureSelfie}
                            disabled={!isCameraReady}
                            className="bg-green-600 text-black font-bold py-3 px-6 rounded uppercase tracking-wider hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isCameraReady ? '📸 CAPTURE' : '⟳ LOADING...'}
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-red-600 text-white font-bold py-3 px-6 rounded uppercase tracking-wider hover:bg-red-500 transition-all"
                          >
                            ✗ CANCEL
                          </button>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-4">
                      <img
                        src={formData.selfie_data}
                        alt="Captured Selfie"
                        className="w-full max-w-md mx-auto rounded-lg border-2 border-green-500/50 object-cover bg-black"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    <p className="text-green-400 mb-4 font-bold">✓ SELFIE CAPTURED SUCCESSFULLY</p>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('selfie_data', '');
                        handleChange('selfie_url', '');
                        setError('');
                      }}
                      className="bg-yellow-600 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition-all"
                    >
                      ↻ RETAKE PHOTO
                    </button>
                  </>
                )}
              </div>

              {/* Hidden canvas for image processing */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
          )}

          {/* Step 4: Aadhaar */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-green-400 mb-2">STEP 4: AADHAAR VERIFICATION</h2>
                <p className="text-gray-400 text-sm">NATIONAL ID AUTHENTICATION</p>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Aadhaar Number * (12 digits)
                </label>
                <input
                  type="text"
                  required
                  value={formData.aadhaar_reference}
                  onChange={(e) => handleChange('aadhaar_reference', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded text-center text-2xl tracking-widest focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="XXXX XXXX XXXX"
                  maxLength={12}
                />
                <p className="mt-2 text-xs text-gray-500">
                  → ENTER 12-DIGIT AADHAAR NUMBER (DIGITS ONLY)
                </p>
              </div>
            </div>
          )}

          {/* Step 5: AePS Details (only for AePS agents) */}
          {currentStep === 5 && formData.category === 'aeps_agent' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-green-400 mb-2">STEP 5: AePS AGENT DETAILS</h2>
                <p className="text-gray-400 text-sm">BANKING SERVICE PROVIDER INFORMATION</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                    Bank Affiliation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bank_affiliation}
                    onChange={(e) => handleChange('bank_affiliation', e.target.value)}
                    className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    placeholder="BANK NAME"
                  />
                </div>

                <div>
                  <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                    BC Affiliation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bc_affiliation}
                    onChange={(e) => handleChange('bc_affiliation', e.target.value)}
                    className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                    placeholder="BC PROVIDER"
                  />
                </div>
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  AePS Operator ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.aeps_operator_id}
                  onChange={(e) => handleChange('aeps_operator_id', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="OPERATOR ID"
                />
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Service Region
                </label>
                <input
                  type="text"
                  value={formData.service_region}
                  onChange={(e) => handleChange('service_region', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="REGION/DISTRICT"
                />
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Device Information
                </label>
                <input
                  type="text"
                  value={formData.aeps_device_info}
                  onChange={(e) => handleChange('aeps_device_info', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="DEVICE MODEL/ID"
                />
              </div>

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Transaction Role
                </label>
                <select
                  value={formData.transaction_role}
                  onChange={(e) => handleChange('transaction_role', e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                >
                  <option value="">SELECT ROLE</option>
                  <option value="agent">AGENT</option>
                  <option value="merchant">MERCHANT</option>
                  <option value="both">BOTH</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 6: Consent & Declaration */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-green-400 mb-2">FINAL STEP: CONSENT & DECLARATION</h2>
                <p className="text-gray-400 text-sm">LEGAL AGREEMENT AND AUTHORIZATION</p>
              </div>

              <div className="border-2 border-green-500/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={formData.consent_given}
                    onChange={(e) => handleChange('consent_given', e.target.checked)}
                    className="mt-1 w-5 h-5 bg-black border-2 border-green-500/50 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <label htmlFor="consent" className="text-sm text-gray-300">
                    I hereby consent to the collection, processing, and verification of my personal data including biometric information for the purpose of identity verification and background checks. I understand that this data will be shared with authorized law enforcement agencies and service providers. *
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="declaration"
                    checked={formData.declaration_signed}
                    onChange={(e) => handleChange('declaration_signed', e.target.checked)}
                    className="mt-1 w-5 h-5 bg-black border-2 border-green-500/50 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <label htmlFor="declaration" className="text-sm text-gray-300">
                    I declare that all information provided is true and accurate to the best of my knowledge. I understand that providing false information may result in legal action and denial of services. *
                  </label>
                </div>
              </div>

              <div className="bg-green-900/20 border border-green-500/30 rounded p-4">
                <p className="text-xs text-gray-400">
                  → BY COMPLETING THIS REGISTRATION, YOU AGREE TO THE TERMS OF SERVICE AND PRIVACY POLICY
                </p>
              </div>
            </div>
          )}

          {/* Validation Warning */}
          {!canProceed && (
            <div className="mt-6 bg-yellow-900/20 border border-yellow-500/50 rounded p-4">
              <p className="text-yellow-400 text-sm font-bold">⚠ REQUIRED FIELDS MISSING</p>
              <p className="text-gray-400 text-xs mt-1">
                {currentStep === 1 && 'Please enter your full name and mobile number'}
                {currentStep === 2 && 'Please fill in all address fields (Address, City, State, 6-digit PIN)'}
                {currentStep === 3 && 'Please capture your selfie using the camera'}
                {currentStep === 4 && 'Please enter a valid 12-digit Aadhaar number'}
                {currentStep === 5 && 'Please fill in all required AePS fields'}
                {currentStep === 6 && 'Please check both consent and declaration checkboxes'}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-green-900/30">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className="bg-gray-800 text-green-400 font-bold py-3 px-6 rounded uppercase tracking-wider border border-green-500/30 hover:bg-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← BACK
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={loading || !canProceed}
              className={`font-bold py-3 px-6 rounded uppercase tracking-wider transition-all ${
                !canProceed || loading
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-green-600 text-black hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)]'
              }`}
            >
              {loading ? '⟳ PROCESSING...' : currentStep === 6 ? '✓ COMPLETE REGISTRATION' : 'NEXT →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
