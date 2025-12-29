/**
 * Police Agent Details Page
 */
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

export default function PoliceAgentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [verificationData, setVerificationData] = useState({
    verification_ref: '',
    police_station: '',
    expiry_date: '',
    notes: '',
  });
  const [incidentData, setIncidentData] = useState({
    title: '',
    description: '',
    incident_type: 'other',
    severity: 'medium',
  });

  useEffect(() => {
    loadAgentDetails();
  }, [params.id]);

  const loadAgentDetails = async () => {
    try {
      const data = await api.getAgentDetails(params.id);
      setAgent(data);
    } catch (err) {
      setError(err.message || 'Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    try {
      await api.suspendAgent(params.id, suspendReason, true);
      setShowSuspendModal(false);
      setSuspendReason('');
      loadAgentDetails();
    } catch (err) {
      alert(err.message || 'Failed to suspend agent');
    }
  };

  const handleVerify = async () => {
    try {
      await api.createPoliceVerification({
        worker_id: parseInt(params.id),
        ...verificationData,
      });
      setShowVerifyModal(false);
      setVerificationData({
        verification_ref: '',
        police_station: '',
        expiry_date: '',
        notes: '',
      });
      loadAgentDetails();
    } catch (err) {
      alert(err.message || 'Failed to create verification');
    }
  };

  const handleLogIncident = async () => {
    try {
      await api.logIncident(
        params.id,
        incidentData.title,
        incidentData.description,
        incidentData.incident_type,
        incidentData.severity
      );
      setShowIncidentModal(false);
      setIncidentData({
        title: '',
        description: '',
        incident_type: 'other',
        severity: 'medium',
      });
      loadAgentDetails();
    } catch (err) {
      alert(err.message || 'Failed to log incident');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['police']}>
        <Layout title="Agent Details">
          <div className="text-center py-12">Loading...</div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (error || !agent) {
    return (
      <ProtectedRoute allowedRoles={['police']}>
        <Layout title="Agent Details">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-800">{error || 'Agent not found'}</p>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['police']}>
      <Layout title={`Agent: ${agent.name}`}>
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Agent Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{agent.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Universal Agent ID: {agent.universal_agent_id}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => setShowSuspendModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Suspend
                  </button>
                  <button
                    onClick={() => setShowIncidentModal(true)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                  >
                    Log Incident
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Mobile</dt>
                      <dd className="text-sm text-gray-900">{agent.mobile}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="text-sm text-gray-900">{agent.status}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Risk Score</dt>
                      <dd className={`text-sm font-semibold ${
                        agent.risk_score >= 70 ? 'text-red-600' :
                        agent.risk_score >= 30 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {agent.risk_score}/100
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Police Verification</dt>
                      <dd className="text-sm text-gray-900">{agent.police_verification_status}</dd>
                    </div>
                    {agent.police_verification_expiry && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Verification Expiry</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(agent.police_verification_expiry).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <dl className="space-y-2">
                    {agent.address && (
                      <>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Line 1</dt>
                          <dd className="text-sm text-gray-900">{agent.address.line1}</dd>
                        </div>
                        {agent.address.line2 && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">Line 2</dt>
                            <dd className="text-sm text-gray-900">{agent.address.line2}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="text-sm font-medium text-gray-500">City, State</dt>
                          <dd className="text-sm text-gray-900">
                            {agent.address.city}, {agent.address.state} - {agent.address.pincode}
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </div>

              {agent.providers && agent.providers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Associated Providers</h3>
                  <div className="space-y-2">
                    {agent.providers.map((provider, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-md">
                        <p className="font-medium">{provider.company_name}</p>
                        <p className="text-sm text-gray-600">
                          {provider.is_approved ? 'Approved' : 'Pending Approval'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Verifications */}
            {agent.recent_verifications && agent.recent_verifications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Verifications</h3>
                <div className="space-y-2">
                  {agent.recent_verifications.map((v) => (
                    <div key={v.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{v.verification_method}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          v.verification_result === 'verified' ? 'bg-green-100 text-green-800' :
                          v.verification_result === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {v.verification_result}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(v.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incidents */}
            {agent.incidents && agent.incidents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Incidents</h3>
                <div className="space-y-2">
                  {agent.incidents.map((i) => (
                    <div key={i.id} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{i.title}</p>
                          <p className="text-sm text-gray-600 mt-1">{i.incident_type}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          i.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          i.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          i.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {i.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(i.created_at).toLocaleString()}
                        {i.is_resolved && ' (Resolved)'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suspend Modal */}
            {showSuspendModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Suspend Agent</h3>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="Enter reason for suspension"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-4"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSuspendModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSuspend}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Suspend
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Verify Modal */}
            {showVerifyModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Police Verification</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Verification Reference"
                      value={verificationData.verification_ref}
                      onChange={(e) => setVerificationData({...verificationData, verification_ref: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Police Station"
                      value={verificationData.police_station}
                      onChange={(e) => setVerificationData({...verificationData, police_station: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      type="date"
                      placeholder="Expiry Date"
                      value={verificationData.expiry_date}
                      onChange={(e) => setVerificationData({...verificationData, expiry_date: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <textarea
                      placeholder="Notes"
                      value={verificationData.notes}
                      onChange={(e) => setVerificationData({...verificationData, notes: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowVerifyModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVerify}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Incident Modal */}
            {showIncidentModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Log Incident</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Title"
                      value={incidentData.title}
                      onChange={(e) => setIncidentData({...incidentData, title: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <textarea
                      placeholder="Description"
                      value={incidentData.description}
                      onChange={(e) => setIncidentData({...incidentData, description: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      rows={4}
                    />
                    <select
                      value={incidentData.incident_type}
                      onChange={(e) => setIncidentData({...incidentData, incident_type: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="fraud_attempt">Fraud Attempt</option>
                      <option value="transaction_mismatch">Transaction Mismatch</option>
                      <option value="suspicious_activity">Suspicious Activity</option>
                      <option value="verification_failure">Verification Failure</option>
                      <option value="other">Other</option>
                    </select>
                    <select
                      value={incidentData.severity}
                      onChange={(e) => setIncidentData({...incidentData, severity: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setShowIncidentModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogIncident}
                      className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
                    >
                      Log Incident
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

