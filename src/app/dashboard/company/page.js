'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLinkWorker, setShowLinkWorker] = useState(false);
  const [workerIdToLink, setWorkerIdToLink] = useState('');

  useEffect(() => {
    if (user?.role !== 'company') {
      router.push('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [companyData, workersData] = await Promise.all([
        api.getMyProvider(),
        api.getMyWorkers()
      ]);
      setCompany(companyData);
      setWorkers(workersData.workers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkWorker = async (e) => {
    e.preventDefault();
    try {
      await api.request(`/companies/workers/${workerIdToLink}/link`, {
        method: 'POST'
      });
      setShowLinkWorker(false);
      setWorkerIdToLink('');
      fetchData();
      alert('Worker linked successfully!');
    } catch (error) {
      alert(error.message || 'Failed to link worker');
    }
  };

  const handleUpdateStatus = async (workerId, status) => {
    try {
      await api.request(`/companies/workers/${workerId}/status`, {
        method: 'POST',
        body: JSON.stringify({
          worker_id: parseInt(workerId),
          status,
          reason: 'Status updated by company'
        })
      });
      fetchData();
      alert('Status updated successfully!');
    } catch (error) {
      alert(error.message || 'Failed to update status');
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
          <h2 className="text-3xl font-bold text-gray-900">Company Dashboard</h2>
          <p className="text-gray-600 mt-2">{company?.company_name}</p>
        </div>

        {/* Company Status */}
        {!company?.is_approved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              ⏳ Your company is pending approval. Some features may be limited until approved.
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Workers</h3>
            <p className="text-3xl font-bold text-gray-900">{workers.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Workers</h3>
            <p className="text-3xl font-bold text-green-600">
              {workers.filter(w => w.status === 'active').length}
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Verification</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {workers.filter(w => w.verification_status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Workers</h3>
          <button
            onClick={() => setShowLinkWorker(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            + Link Worker
          </button>
        </div>

        {/* Link Worker Modal */}
        {showLinkWorker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Link Worker</h3>
              <form onSubmit={handleLinkWorker}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Worker ID
                  </label>
                  <input
                    type="text"
                    value={workerIdToLink}
                    onChange={(e) => setWorkerIdToLink(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="IND-WRK-XXX-2024-XXXXXX"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLinkWorker(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Workers List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Worker ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Risk Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No workers linked yet. Click "Link Worker" to add workers.
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {worker.worker_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {worker.category?.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        worker.status === 'active' ? 'bg-green-100 text-green-800' :
                        worker.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {worker.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        worker.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                        worker.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {worker.verification_status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {worker.risk_score}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        onChange={(e) => handleUpdateStatus(worker.worker_id, e.target.value)}
                        value={worker.status}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* API Key Section */}
        {company?.is_approved && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Access</h3>
            {company.api_key ? (
              <div>
                <p className="text-sm text-gray-600 mb-2">Your API Key:</p>
                <code className="block bg-gray-100 px-4 py-2 rounded text-sm font-mono">
                  {company.api_key}
                </code>
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const result = await api.request('/companies/generate-api-key', {
                      method: 'POST'
                    });
                    alert(`API Key generated: ${result.api_key}`);
                    fetchData();
                  } catch (error) {
                    alert(error.message || 'Failed to generate API key');
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Generate API Key
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

