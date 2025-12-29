'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function WorkerOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data for all steps
  const [formData, setFormData] = useState({
    // Step 1
    category: 'delivery_worker',
    full_name: '',
    mobile: '',
    // Step 2
    address_current: '',
    city: '',
    state: '',
    pincode: '',
    // Step 3
    selfie_url: '',
    // Step 4
    aadhaar_reference: '',
    // Step 5 (AePS only)
    bank_affiliation: '',
    bc_affiliation: '',
    aeps_operator_id: '',
    service_region: '',
    aeps_device_info: '',
    transaction_role: '',
    // Step 6
    consent_given: false,
    declaration_signed: false,
    device_fingerprint: ''
  });

  useEffect(() => {
    // Check onboarding status
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await api.get('/workers/onboarding/status');
      if (response.completed) {
        router.push('/dashboard/worker');
      } else if (response.current_step > 0) {
        setCurrentStep(response.current_step);
        if (response.data) {
          // Load saved data
          setFormData(prev => ({ ...prev, ...response.data }));
        }
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
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
          if (!formData.selfie_url) {
            setError('Please capture your selfie');
            setLoading(false);
            return;
          }
          await api.post('/workers/onboard/step3', { selfie_url: formData.selfie_url });
          break;
          
        case 4:
          await api.post('/workers/onboard/step4', { aadhaar_reference: formData.aadhaar_reference });
          break;
          
        case 5:
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
          if (!formData.consent_given || !formData.declaration_signed) {
            setError('Please provide consent and sign the declaration');
            setLoading(false);
            return;
          }
          const result = await api.post('/workers/onboard/step6', {
            consent_given: formData.consent_given,
            declaration_signed: formData.declaration_signed,
            device_fingerprint: navigator.userAgent
          });
          
          // Onboarding complete
          alert(`Onboarding complete! Your Worker ID: ${result.worker_id}`);
          router.push('/dashboard/worker');
          return;
      }
      
      setCurrentStep(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to save step');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const captureSelfie = () => {
    // In production, integrate with camera API
    // For now, use file upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // In production, upload to S3/storage
        // For demo, use data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          handleChange('selfie_url', event.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 6</span>
            <span className="text-sm font-medium text-blue-600">{Math.round((currentStep / 6) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Worker Onboarding
          </h1>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Category Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="delivery_worker">Delivery Worker</option>
                  <option value="aeps_agent">AePS Agent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="+91XXXXXXXXXX"
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Address */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Address Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Address
                </label>
                <textarea
                  value={formData.address_current}
                  onChange={(e) => handleChange('address_current', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  maxLength={6}
                  required
                />
              </div>
            </div>
          )}

          {/* Step 3: Selfie */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Live Selfie Capture</h2>
              <p className="text-sm text-gray-600">
                Capture a clear photo of your face. This will be used for verification.
              </p>
              
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
                {formData.selfie_url ? (
                  <div className="text-center">
                    <img 
                      src={formData.selfie_url} 
                      alt="Selfie" 
                      className="w-64 h-64 object-cover rounded-lg mb-4"
                    />
                    <button
                      type="button"
                      onClick={captureSelfie}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Retake Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={captureSelfie}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
                  >
                    Capture Selfie
                  </button>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ Ensure good lighting and remove any face coverings
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Aadhaar Reference */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Aadhaar Verification</h2>
              <p className="text-sm text-gray-600">
                We only store a reference token, not your actual Aadhaar number.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhaar Reference Token
                </label>
                <input
                  type="text"
                  value={formData.aadhaar_reference}
                  onChange={(e) => handleChange('aadhaar_reference', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter Aadhaar reference"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <p className="text-sm text-blue-800">
                  🔒 Your Aadhaar number is never stored. We only keep a secure reference token.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: AePS Specific */}
          {currentStep === 5 && formData.category === 'aeps_agent' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">AePS Agent Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Affiliation
                </label>
                <input
                  type="text"
                  value={formData.bank_affiliation}
                  onChange={(e) => handleChange('bank_affiliation', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BC Affiliation
                </label>
                <input
                  type="text"
                  value={formData.bc_affiliation}
                  onChange={(e) => handleChange('bc_affiliation', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AePS Operator ID
                </label>
                <input
                  type="text"
                  value={formData.aeps_operator_id}
                  onChange={(e) => handleChange('aeps_operator_id', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Region
                </label>
                <input
                  type="text"
                  value={formData.service_region}
                  onChange={(e) => handleChange('service_region', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Device Information
                </label>
                <input
                  type="text"
                  value={formData.aeps_device_info}
                  onChange={(e) => handleChange('aeps_device_info', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Role Declaration
                </label>
                <textarea
                  value={formData.transaction_role}
                  onChange={(e) => handleChange('transaction_role', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 5 && formData.category === 'delivery_worker' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Almost Done!</h2>
              <p className="text-gray-600">
                Proceed to the next step to complete your onboarding.
              </p>
            </div>
          )}

          {/* Step 6: Consent */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Consent & Declaration</h2>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consent_given}
                    onChange={(e) => handleChange('consent_given', e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    I consent to the collection and processing of my data for verification purposes.
                    I understand that my data will be used in accordance with the platform's privacy policy.
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.declaration_signed}
                    onChange={(e) => handleChange('declaration_signed', e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    I declare that all the information provided is true and accurate to the best of my knowledge.
                    I understand that providing false information may result in rejection or suspension.
                  </span>
                </label>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">
                  ✓ After submission, your profile will be sent for police verification.
                  You'll receive your Worker ID once verified.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Back
              </button>
            )}
            
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 ${
                currentStep === 1 ? 'ml-auto' : ''
              }`}
            >
              {loading ? 'Saving...' : currentStep === 6 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

