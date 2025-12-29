'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function PoliceDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'police') {
      router.push('/');
      return;
    }
    fetchVerificationQueue();
  }, [user]);

  const fetchVerificationQueue = async () => {
    try {
      const data = await api.request('/police/verification-queue');
      setVerificationQueue(data.workers || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const data = await api.searchAgent(searchQuery);
      setSearchResults(data.workers || []);
    } catch (error) {
      alert(error.message || 'Search failed');
    }
  };

  const handleViewDetails = async (workerId) => {
    try {
      const data = await api.getAgentDetails(workerId);
      setSelectedWorker(data);
    } catch (error) {
      alert(error.message || 'Failed to load worker details');
    }
  };

  const handleVerify = async (workerId, status) => {
    const certificate = prompt('Enter certificate number (optional):');
    const remarks = prompt('Enter remarks:');

    try {
      await api.createPoliceVerification({
        worker_id: workerId,
        status,
        certificate_number: certificate || null,
        remarks: remarks || null
      });
      alert('Verification completed!');
      setSelectedWorker(null);
      fetchVerificationQueue();
    } catch (error) {
      alert(error.message || 'Verification failed');
    }
  };

  const handleSuspend = async (workerId) => {
    const reason = prompt('Enter reason for suspension:');
    if (!reason) return;

    const temporary = confirm('Temporary suspension? (OK = Yes, Cancel = Permanent)');

    try {
      await api.suspendAgent(workerId, reason, temporary);
      alert('Worker suspended successfully');
      fetchVerificationQueue();
    } catch (error) {
      alert(error.message || 'Failed to suspend worker');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Jan Suraksha - Police Portal</h1>
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
          <h2 className="text-3xl font-bold text-gray-900">Police Dashboard</h2>
          <p className="text-gray-600 mt-2">Officer: {user?.full_name}</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Workers</h3>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Worker ID, Name, or Mobile"
              className="flex-1 rounded-md border border-gray-300 px-4 py-2"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Search Results:</h4>
              <div className="space-y-2">
                {searchResults.map((worker) => (
                  <div
                    key={worker.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <p className="font-medium">{worker.full_name}</p>
                      <p className="text-sm text-gray-600">{worker.worker_id}</p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(worker.worker_id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Verification Queue */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Verification Queue ({verificationQueue.length})
          </h3>
          
          {verificationQueue.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No pending verifications</p>
          ) : (
            <div className="space-y-3">
              {verificationQueue.map((worker) => (
                <div
                  key={worker.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{worker.full_name}</h4>
                      <p className="text-sm text-gray-600 font-mono">{worker.worker_id}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Category: <span className="capitalize">{worker.category?.replace('_', ' ')}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Location: {worker.city}, {worker.state}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(worker.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(worker.worker_id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Worker Details Modal */}
        {selectedWorker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedWorker.user?.full_name}</h3>
                    <p className="text-gray-600 font-mono">{selectedWorker.worker_id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedWorker(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Photo */}
                {selectedWorker.selfie_url && (
                  <div className="mb-6">
                    <img
                      src={selectedWorker.selfie_url}
                      alt="Worker Photo"
                      className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Category</h4>
                    <p className="mt-1 capitalize">{selectedWorker.category?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Mobile</h4>
                    <p className="mt-1">{selectedWorker.user?.mobile}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Email</h4>
                    <p className="mt-1">{selectedWorker.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600">Aadhaar Reference</h4>
                    <p className="mt-1 font-mono text-sm">{selectedWorker.aadhaar_reference}</p>
                  </div>
                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-600">Address</h4>
                    <p className="mt-1">
                      {selectedWorker.address}, {selectedWorker.city}, {selectedWorker.state} - {selectedWorker.pincode}
                    </p>
                  </div>
                </div>

                {/* AePS Details */}
                {selectedWorker.category === 'aeps_agent' && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">AePS Information</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Bank:</span> {selectedWorker.bank_affiliation}
                      </div>
                      <div>
                        <span className="text-gray-600">Operator ID:</span> {selectedWorker.aeps_operator_id}
                      </div>
                    </div>
                  </div>
                )}

                {/* Risk Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Risk Score</h4>
                      <p className="text-2xl font-bold text-gray-900">{selectedWorker.risk_score}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600">Complaints</h4>
                      <p className="text-2xl font-bold text-gray-900">{selectedWorker.complaint_count}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(selectedWorker.id, 'verified')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleVerify(selectedWorker.id, 'rejected')}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleSuspend(selectedWorker.worker_id)}
                    className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
