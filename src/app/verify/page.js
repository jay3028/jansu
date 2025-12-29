'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/services/api';

export default function VerifyPage() {
  const [searchType, setSearchType] = useState('worker_id');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWorker(null);

    try {
      const requestData = {};
      
      if (searchType === 'worker_id') {
        requestData.worker_id = searchValue;
      } else if (searchType === 'mobile') {
        requestData.mobile = searchValue;
      } else if (searchType === 'qr') {
        requestData.qr_data = searchValue;
      }

      const result = await api.verifyAgent(requestData);
      setWorker(result);
    } catch (err) {
      setError(err.message || 'Worker not found');
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score < 20) return { label: 'Low Risk', color: 'green' };
    if (score < 50) return { label: 'Medium Risk', color: 'yellow' };
    return { label: 'High Risk', color: 'red' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Jan Suraksha
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Sign In
              </Link>
              <Link href="/auth/signup" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Verify Agent
          </h1>
          <p className="text-xl text-gray-600">
            Instantly verify delivery workers and AePS agents before transactions
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            {/* Search Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Search By
              </label>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSearchType('worker_id')}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    searchType === 'worker_id'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  Worker ID
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('mobile')}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    searchType === 'mobile'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  Mobile Number
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType('qr')}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    searchType === 'qr'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                  }`}
                >
                  Scan QR
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {searchType === 'worker_id' && 'Enter Worker ID'}
                {searchType === 'mobile' && 'Enter Mobile Number'}
                {searchType === 'qr' && 'Scan or Enter QR Data'}
              </label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg"
                placeholder={
                  searchType === 'worker_id' ? 'IND-WRK-XXX-2024-XXXXXX' :
                  searchType === 'mobile' ? '+91XXXXXXXXXX' :
                  'Scan QR code or paste data'
                }
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !searchValue}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Verifying...' : 'Verify Agent'}
            </button>
          </form>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {worker && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Status Banner */}
            <div className={`px-8 py-4 ${
              worker.is_active && worker.police_verified
                ? 'bg-green-600'
                : worker.verification_status === 'pending'
                ? 'bg-yellow-600'
                : 'bg-red-600'
            }`}>
              <div className="flex items-center justify-center text-white">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  {worker.is_active && worker.police_verified ? (
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
                <span className="text-lg font-semibold">
                  {worker.is_active && worker.police_verified
                    ? 'VERIFIED AGENT'
                    : worker.verification_status === 'pending'
                    ? 'VERIFICATION PENDING'
                    : 'NOT VERIFIED'}
                </span>
              </div>
            </div>

            {/* Worker Details */}
            <div className="p-8">
              <div className="flex items-start gap-6 mb-6">
                {/* Photo */}
                {worker.photo_url && (
                  <img
                    src={worker.photo_url}
                    alt={worker.full_name}
                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                  />
                )}

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {worker.full_name}
                  </h2>
                  <p className="text-lg text-gray-600 mb-3 font-mono">
                    {worker.worker_id}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                      {worker.role?.replace('_', ' ').toUpperCase()}
                    </span>
                    {worker.police_verified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Police Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-2 gap-6 py-6 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Company</span>
                  <p className="text-base font-medium text-gray-900">
                    {worker.company_name || 'Not linked to any company'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 block mb-1">Last Verified</span>
                  <p className="text-base font-medium text-gray-900">
                    {worker.last_verification_date
                      ? new Date(worker.last_verification_date).toLocaleDateString()
                      : 'Not verified'}
                  </p>
                </div>
              </div>

              {/* Risk Score */}
              <div className="py-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Trust Level</span>
                    <span className={`text-lg font-semibold ${
                      getRiskLevel(worker.risk_score).color === 'green' ? 'text-green-600' :
                      getRiskLevel(worker.risk_score).color === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {getRiskLevel(worker.risk_score).label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-gray-900">
                      {100 - worker.risk_score}
                    </span>
                    <span className="text-gray-600">/100</span>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  🔒 This verification is provided by Jan Suraksha, a government-backed trust platform.
                  Always verify the agent's identity before any transaction.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works */}
        {!worker && !loading && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter Details
                </h3>
                <p className="text-gray-600 text-sm">
                  Enter the worker's ID, mobile number, or scan their QR code
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Instant Verification
                </h3>
                <p className="text-gray-600 text-sm">
                  Get real-time verification status and trust score
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Safe Transaction
                </h3>
                <p className="text-gray-600 text-sm">
                  Proceed with confidence knowing the agent is verified
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
