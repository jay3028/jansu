'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function FaceSearchPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const webcamRef = useRef(null);
  
  const [searchImage, setSearchImage] = useState(null);
  const [searchImagePreview, setSearchImagePreview] = useState(null);
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [threshold, setThreshold] = useState(80);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);

  // Cleanup webcam stream on unmount
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [webcamStream]);

  // Redirect if not police
  if (user && user.role !== 'police') {
    router.push('/');
    return null;
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setSearchImage(base64);
        setSearchImagePreview(base64);
        setError('');
        setMatches([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startWebcam = async () => {
    try {
      // First set useWebcam to true so the video element gets rendered
      setUseWebcam(true);
      setError('');
      
      // Wait a bit for the video element to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      
      // Check if the video element ref exists
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        setWebcamStream(stream);
      } else {
        console.error('Video element not found');
        stream.getTracks().forEach(track => track.stop());
        setUseWebcam(false);
        setError('Failed to initialize webcam. Please try again.');
      }
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setUseWebcam(false);
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError('Failed to access webcam. Please check permissions and try again.');
      }
    }
  };

  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    setUseWebcam(false);
  };

  const captureFromWebcam = () => {
    if (!webcamRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = webcamRef.current.videoWidth;
    canvas.height = webcamRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(webcamRef.current, 0, 0);
    
    const base64 = canvas.toDataURL('image/jpeg');
    setSearchImage(base64);
    setSearchImagePreview(base64);
    stopWebcam();
    setError('');
    setMatches([]);
  };

  const handleSearch = async () => {
    if (!searchImage) {
      setError('Please select or capture an image first');
      return;
    }

    setSearching(true);
    setError('');
    setMatches([]);

    try {
      const response = await api.post('/police/face-search', {
        image: searchImage,
        threshold: threshold,
        max_results: 10
      });

      if (response.matches && response.matches.length > 0) {
        setMatches(response.matches);
      } else {
        setError('No matching workers found in the database');
      }
    } catch (err) {
      console.error('Face search error:', err);
      setError(err.message || 'Face search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchImage(null);
    setSearchImagePreview(null);
    setMatches([]);
    setError('');
    stopWebcam();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar user={user} onLogout={logout} />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-400 mb-2">
            🔍 FACE RECOGNITION SEARCH
          </h1>
          <p className="text-gray-400">
            Upload or capture a photo to find matching workers in the database
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Image Input */}
          <div className="space-y-6">
            {/* Image Upload/Capture Card */}
            <div className="bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <h2 className="text-xl font-bold text-green-400 mb-4">IMAGE INPUT</h2>

              {/* Image Preview */}
              <div className="mb-6">
                {useWebcam ? (
                  <div className="relative">
                    <video
                      ref={webcamRef}
                      autoPlay
                      playsInline
                      className="w-full rounded-lg border-2 border-green-500/30"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                      <button
                        onClick={captureFromWebcam}
                        className="bg-green-600 text-black font-bold py-2 px-6 rounded hover:bg-green-500 transition-all"
                      >
                        📸 CAPTURE
                      </button>
                      <button
                        onClick={stopWebcam}
                        className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-500 transition-all"
                      >
                        ✕ CANCEL
                      </button>
                    </div>
                  </div>
                ) : searchImagePreview ? (
                  <div className="relative">
                    <img
                      src={searchImagePreview}
                      alt="Search Image"
                      className="w-full rounded-lg border-2 border-green-500/30"
                    />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-gray-900/50 border-2 border-dashed border-green-500/30 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p>NO IMAGE SELECTED</p>
                      <p className="text-sm mt-2">Upload or capture a photo to begin</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={searching || useWebcam}
                  className="w-full bg-green-600 text-black font-bold py-3 px-6 rounded hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📁 UPLOAD PHOTO
                </button>
                
                <button
                  onClick={startWebcam}
                  disabled={searching || useWebcam || searchImagePreview}
                  className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📷 USE WEBCAM
                </button>

                {searchImagePreview && (
                  <button
                    onClick={clearSearch}
                    disabled={searching}
                    className="w-full bg-gray-700 text-white font-bold py-3 px-6 rounded hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🗑️ CLEAR
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Search Settings Card */}
            <div className="bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <h2 className="text-xl font-bold text-green-400 mb-4">SEARCH SETTINGS</h2>

              <div className="mb-4">
                <label className="block text-green-400 text-sm font-bold mb-2">
                  SIMILARITY THRESHOLD: {threshold}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={threshold}
                  onChange={(e) => setThreshold(parseInt(e.target.value))}
                  disabled={searching}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Higher threshold = More accurate matches (fewer results)
                </p>
              </div>

              <button
                onClick={handleSearch}
                disabled={!searchImage || searching}
                className="w-full bg-green-600 text-black font-bold py-3 px-6 rounded hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searching ? '⟳ SEARCHING...' : '🔍 SEARCH DATABASE'}
              </button>
            </div>
          </div>

          {/* Right Panel - Search Results */}
          <div>
            <div className="bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <h2 className="text-xl font-bold text-green-400 mb-4">
                SEARCH RESULTS ({matches.length})
              </h2>

              {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400">
                  ⚠️ {error}
                </div>
              )}

              {searching ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
                  <p className="text-green-400 text-lg">Searching database...</p>
                  <p className="text-gray-400 text-sm mt-2">Comparing faces with {threshold}% threshold</p>
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {matches.map((match, idx) => (
                    <div
                      key={idx}
                      onClick={() => router.push(`/dashboard/police/verify/${match.worker_internal_id}`)}
                      className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-green-500/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* Worker Photo */}
                        {match.selfie_url && (
                          <img
                            src={`http://localhost:8000/${match.selfie_url}`}
                            alt="Worker"
                            className="w-20 h-20 rounded-lg border-2 border-green-500/30 object-cover"
                          />
                        )}

                        {/* Worker Info */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-lg font-bold text-white">{match.full_name}</h3>
                              <p className="text-sm text-green-400 font-mono">{match.worker_id}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-400">{match.similarity}%</div>
                              <div className="text-xs text-gray-400">MATCH</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Category:</span>
                              <span className="text-white ml-2">{match.category}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <span className={`ml-2 ${
                                match.verification_status === 'verified' ? 'text-green-400' :
                                match.verification_status === 'pending' ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                {match.verification_status?.toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Mobile:</span>
                              <span className="text-white ml-2">{match.mobile_number}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Location:</span>
                              <span className="text-white ml-2">{match.city}, {match.state}</span>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-400">
                            Confidence: {match.confidence}% | Click to view full profile →
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p>NO RESULTS YET</p>
                  <p className="text-sm mt-2">Upload or capture a photo and click search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

