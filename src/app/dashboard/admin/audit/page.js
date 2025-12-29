/**
 * Admin Audit Logs Page
 */
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const data = await api.getAuditLogs(0, 100);
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      verification: 'bg-blue-100 text-blue-800',
      incident: 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['admin']}>
        <Layout title="Audit Logs">
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <Layout title="Audit Logs">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Audit Logs ({logs.length})</h2>
            </div>

            {error && (
              <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  No audit logs found
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(log.type)}`}>
                            {log.type.toUpperCase()}
                          </span>
                          {log.type === 'incident' && log.severity && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(log.severity)}`}>
                              {log.severity.toUpperCase()}
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {log.type === 'verification' ? `Verification #${log.id}` : log.title || `Incident #${log.id}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          {log.type === 'verification' && (
                            <>
                              <div>
                                <span className="text-gray-500">Method:</span> {log.verification_method}
                              </div>
                              <div>
                                <span className="text-gray-500">Result:</span> {log.result}
                              </div>
                            </>
                          )}
                          {log.type === 'incident' && (
                            <>
                              <div>
                                <span className="text-gray-500">Type:</span> {log.incident_type}
                              </div>
                              <div>
                                <span className="text-gray-500">Severity:</span> {log.severity}
                              </div>
                            </>
                          )}
                          {log.worker_id && (
                            <div>
                              <span className="text-gray-500">Worker ID:</span> {log.worker_id}
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Time:</span>{' '}
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

