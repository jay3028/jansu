/**
 * Police Agent Search Page
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';
import Link from 'next/link';

export default function PoliceSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await api.searchAgent(query);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      blacklisted: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <ProtectedRoute allowedRoles={['police']}>
      <Layout title="Search Agent">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Search Agent</h2>
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by QR code, phone number, name, or Universal Agent ID"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold">Search Results ({results.length})</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {results.map((agent) => (
                    <div key={agent.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold">{agent.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                              {agent.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Agent ID</p>
                              <p className="font-mono text-xs">{agent.universal_agent_id}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Mobile</p>
                              <p>{agent.mobile}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Risk Score</p>
                              <p className={`font-semibold ${getRiskColor(agent.risk_score)}`}>
                                {agent.risk_score}/100
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Police Verification</p>
                              <p className="text-xs">{agent.police_verification_status}</p>
                            </div>
                          </div>
                          {agent.providers && agent.providers.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Providers: {agent.providers.join(', ')}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/dashboard/police/agent/${agent.id}`}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.length === 0 && !loading && query && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">No agents found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

