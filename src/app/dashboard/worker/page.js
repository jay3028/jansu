'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'worker') {
      router.push('/');
      return;
    }
    fetchWorkerData();
  }, [user]);

  const fetchWorkerData = async () => {
    try {
      const data = await api.getMyWorker();
      setWorker(data);
      
      // If onboarding not complete, redirect
      if (!data.worker_id) {
        router.push('/worker/onboarding');
      }
    } catch (error) {
      console.error('Error fetching worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending_verification: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getVerificationStatusColor = (status) => {
    const colors = {
      verified: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Jan Suraksha</h1>
            <button
              onClick={logout}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Worker Dashboard</h2>
          <p className="text-gray-600 mt-2">Welcome, {user?.full_name}</p>
        </div>

        {/* Worker ID Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Worker ID</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Worker ID:</span>
                  <p className="text-2xl font-mono font-bold text-blue-600">{worker?.worker_id}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Category:</span>
                  <p className="text-lg font-medium capitalize">{worker?.category?.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(worker?.status)}`}>
                    {worker?.status?.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getVerificationStatusColor(worker?.verification_status)}`}>
                    {worker?.verification_status?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {worker?.qr_code_url && (
              <div className="ml-6">
                <img 
                  src={worker.qr_code_url} 
                  alt="Worker QR Code" 
                  className="w-40 h-40 border-2 border-gray-200 rounded-lg"
                />
                <p className="text-xs text-center text-gray-600 mt-2">Your QR Code</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
            
            {worker?.verification_status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⏳ Your profile is pending police verification. You'll be notified once verified.
                </p>
              </div>
            )}

            {worker?.verification_status === 'verified' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Your profile has been verified by police. You can now work with registered companies.
                </p>
              </div>
            )}

            {worker?.verification_status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ✗ Your verification was rejected. Please contact support for more information.
                </p>
              </div>
            )}
          </div>

          {/* Risk Score Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Score</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {100 - (worker?.risk_score || 0)}
                  </span>
                  <span className="text-xl text-gray-600 ml-1">/100</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {worker?.risk_score === 0 ? 'Excellent' : worker?.risk_score < 20 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>
              <div className="ml-4">
                <svg className="w-20 h-20" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray={`${100 - (worker?.risk_score || 0)}, 100`}
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Full Name:</span>
                <p className="text-base font-medium">{user?.full_name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Mobile:</span>
                <p className="text-base font-medium">{user?.mobile || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="text-base font-medium">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">City:</span>
                <p className="text-base font-medium">{worker?.city || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Complaints Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complaint History</h3>
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{worker?.complaint_count || 0}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">
                  {worker?.complaint_count === 0 
                    ? 'No complaints registered'
                    : `${worker?.complaint_count} complaint(s) on record`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use Your Worker ID</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Show your QR code to customers for instant verification</li>
            <li>• Keep your Worker ID handy for company registration</li>
            <li>• Maintain good behavior to keep your trust score high</li>
            <li>• Report any suspicious activity immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
