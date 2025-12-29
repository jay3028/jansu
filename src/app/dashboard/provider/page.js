/**
 * Provider Dashboard
 */
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';
import Link from 'next/link';

export default function ProviderDashboard() {
  const [provider, setProvider] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [providerData, workersData] = await Promise.all([
        api.getMyProvider().catch(() => null),
        api.getMyWorkers().catch(() => []),
      ]);
      setProvider(providerData);
      setWorkers(workersData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendWorker = async (workerId) => {
    if (!confirm('Are you sure you want to suspend this worker?')) return;
    
    try {
      await api.suspendWorker(workerId);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to suspend worker');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['provider']}>
        <Layout title="Provider Dashboard">
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['provider']}>
      <Layout title="Provider Dashboard">
        <div className="px-4 py-6 sm:px-0">
          {!provider && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Register Your Provider Profile</h2>
              <p className="text-gray-600 mb-4">
                Complete your provider registration to start onboarding workers.
              </p>
              <Link
                href="/providers/register"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Register Now
              </Link>
            </div>
          )}

          {provider && (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{provider.company_name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact Email</p>
                    <p className="text-sm font-medium">{provider.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact Phone</p>
                    <p className="text-sm font-medium">{provider.contact_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="text-sm font-medium">
                      {provider.is_approved ? (
                        <span className="text-green-600">Approved</span>
                      ) : (
                        <span className="text-yellow-600">Pending Approval</span>
                      )}
                    </p>
                  </div>
                  {provider.api_key && (
                    <div>
                      <p className="text-sm text-gray-500">API Key</p>
                      <p className="text-sm font-mono text-xs">{provider.api_key.substring(0, 20)}...</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">My Workers ({workers.length})</h3>
                  <Link
                    href="/workers/onboard"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Onboard New Worker
                  </Link>
                </div>

                {workers.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No workers onboarded yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agent ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {workers.map((worker) => (
                          <tr key={worker.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{worker.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{worker.universal_agent_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                worker.status === 'active' ? 'bg-green-100 text-green-800' :
                                worker.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {worker.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={worker.risk_score >= 70 ? 'text-red-600' : worker.risk_score >= 30 ? 'text-yellow-600' : 'text-green-600'}>
                                {worker.risk_score}/100
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleSuspendWorker(worker.id)}
                                className="text-red-600 hover:text-red-800"
                                disabled={worker.status === 'suspended'}
                              >
                                {worker.status === 'suspended' ? 'Suspended' : 'Suspend'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

