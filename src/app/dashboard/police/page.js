'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function PoliceDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [verifications, setVerifications] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Don't redirect, just show error if not police
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setError('');
      const [verificationsData, incidentsData] = await Promise.all([
        api.get('/police/verifications/pending').catch(() => ({ verifications: [] })),
        api.get('/police/incidents').catch(() => ({ incidents: [] }))
      ]);
      setVerifications(verificationsData.verifications || []);
      setIncidents(incidentsData.incidents || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId) => {
    try {
      await api.request(`/police/verifications/${verificationId}/approve`, {
        method: 'POST'
      });
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to approve verification');
    }
  };

  const handleReject = async (verificationId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      await api.request(`/police/verifications/${verificationId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to reject verification');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-green-400 text-xl">⟳ LOADING DASHBOARD...</div>
      </div>
    );
  }

  // Check if user has police role
  if (user && user.role !== 'police') {
    return (
      <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
        <Navbar showAuth={true} user={user} onLogout={handleLogout} />
        
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="max-w-md text-center">
            <div className="bg-red-900/20 border-2 border-red-500/50 rounded-lg p-8">
              <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-2xl font-bold text-red-400 mb-2">ACCESS DENIED</h2>
              <p className="text-gray-400 mb-4">
                This dashboard is only accessible to police officers.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your role: <span className="text-red-400 font-bold uppercase">{user.role}</span>
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-green-600 text-black font-bold py-2 px-6 rounded hover:bg-green-500 transition-all"
              >
                GO TO HOME
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = verifications.filter(v => v.status === 'pending').length;
  const approvedCount = verifications.filter(v => v.status === 'approved').length;
  const rejectedCount = verifications.filter(v => v.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} user={user} onLogout={handleLogout} />
      
      {/* Error Message */}
      {error && (
        <div className="relative z-50 bg-red-900/20 border-b-2 border-red-500/50 py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-red-400 text-2xl">✗</div>
              <div>
                <p className="text-red-400 font-bold">ERROR</p>
                <p className="text-gray-400 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchData}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-500 transition-all"
            >
              RETRY
            </button>
          </div>
        </div>
      )}
      
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      {/* Page Header */}
      <div className="relative z-10 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-400">// POLICE_DASHBOARD</h1>
            <p className="text-xs text-gray-400 mt-1">LAW ENFORCEMENT VERIFICATION SYSTEM</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/police/face-search"
              className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-500 transition-all text-sm flex items-center gap-2"
            >
              🔍 FACE SEARCH
            </Link>
            <Link
              href="/dashboard/police/search"
              className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm"
            >
              SEARCH AGENT
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="p-6 rounded-lg border-2 border-yellow-500/50 bg-yellow-900/10">
            <div className="text-xs text-gray-400 mb-2">PENDING</div>
            <div className="text-4xl font-bold text-yellow-400">{pendingCount}</div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATIONS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">APPROVED</div>
            <div className="text-4xl font-bold text-green-400">{approvedCount}</div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATIONS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-red-500/50 bg-red-900/10">
            <div className="text-xs text-gray-400 mb-2">REJECTED</div>
            <div className="text-4xl font-bold text-red-400">{rejectedCount}</div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATIONS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-red-500/50 bg-red-900/10">
            <div className="text-xs text-gray-400 mb-2">INCIDENTS</div>
            <div className="text-4xl font-bold text-red-400">{incidents.length}</div>
            <div className="text-xs text-gray-400 mt-2">REPORTED</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-green-900/30">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'pending'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              PENDING ({pendingCount})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'all'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              ALL VERIFICATIONS
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'incidents'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              INCIDENTS
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          
          {/* Pending Tab */}
          {activeTab === 'pending' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">PENDING VERIFICATIONS</h2>
              
              {verifications.filter(v => v.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                  {verifications.filter(v => v.status === 'pending').map((verification, idx) => (
                    <div 
                      key={idx} 
                      className="bg-yellow-900/10 border border-yellow-500/30 rounded-lg p-6 hover:border-yellow-500/50 transition-all cursor-pointer"
                      onClick={() => router.push(`/dashboard/police/verify/${verification.id}`)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{verification.worker?.full_name || 'N/A'}</h3>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-400">Worker ID:</span>
                              <span className={`ml-2 font-mono ${
                                verification.worker_id === 'Pending Verification' 
                                  ? 'text-yellow-400 italic' 
                                  : 'text-white'
                              }`}>
                                {verification.worker_id}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Mobile:</span>
                              <span className="text-white ml-2">{verification.worker?.mobile || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Category:</span>
                              <span className="text-white ml-2 uppercase">{verification.worker?.category || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Submitted:</span>
                              <span className="text-white ml-2">{new Date(verification.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-yellow-400 bg-yellow-900/20 px-3 py-1 rounded border border-yellow-500/50">
                          PENDING
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-yellow-900/30 text-green-400 hover:text-green-300 transition-all">
                        <span className="font-bold text-sm uppercase tracking-wider">Click to View Full Details & Verify</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>NO PENDING VERIFICATIONS</p>
                </div>
              )}
            </div>
          )}

          {/* All Verifications Tab */}
          {activeTab === 'all' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">ALL VERIFICATIONS</h2>
              
              {verifications.length > 0 ? (
                <div className="space-y-4">
                  {verifications.map((verification, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => router.push(`/dashboard/police/verify/${verification.id}`)}
                      className={`border rounded-lg p-6 cursor-pointer hover:scale-[1.02] transition-all ${
                      verification.status === 'approved' ? 'bg-green-900/10 border-green-500/30 hover:border-green-500/60' :
                      verification.status === 'rejected' ? 'bg-red-900/10 border-red-500/30 hover:border-red-500/60' :
                      'bg-yellow-900/10 border-yellow-500/30 hover:border-yellow-500/60'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{verification.worker?.full_name || 'N/A'}</h3>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-400">Worker ID:</span>
                              <span className={`ml-2 font-mono ${
                                verification.worker_id === 'Pending Verification' 
                                  ? 'text-yellow-400 italic' 
                                  : 'text-white'
                              }`}>
                                {verification.worker_id}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <span className={`ml-2 font-bold uppercase ${
                                verification.status === 'approved' ? 'text-green-400' :
                                verification.status === 'rejected' ? 'text-red-400' :
                                'text-yellow-400'
                              }`}>{verification.status}</span>
                            </div>
                            {verification.rejection_reason && (
                              <div>
                                <span className="text-gray-400">Reason:</span>
                                <span className="text-red-400 ml-2">{verification.rejection_reason}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`text-xs px-3 py-1 rounded border ${
                            verification.status === 'approved' ? 'text-green-400 bg-green-900/20 border-green-500/50' :
                            verification.status === 'rejected' ? 'text-red-400 bg-red-900/20 border-red-500/50' :
                            'text-yellow-400 bg-yellow-900/20 border-yellow-500/50'
                          }`}>
                            {verification.status?.toUpperCase()}
                          </div>
                          <div className="text-xs text-green-400 flex items-center gap-1">
                            <span>View Details</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>NO VERIFICATIONS FOUND</p>
                </div>
              )}
            </div>
          )}

          {/* Incidents Tab */}
          {activeTab === 'incidents' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">REPORTED INCIDENTS</h2>
              
              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {incidents.map((incident, idx) => (
                    <div key={idx} className="bg-red-900/10 border border-red-500/30 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-red-400 mb-2">{incident.incident_type}</h3>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-400">Worker:</span>
                              <span className="text-white ml-2">{incident.worker?.full_name || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Date:</span>
                              <span className="text-white ml-2">{new Date(incident.incident_date).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Location:</span>
                              <span className="text-white ml-2">{incident.incident_location || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-red-400 bg-red-900/20 px-3 py-1 rounded border border-red-500/50">
                          INCIDENT
                        </div>
                      </div>
                      <div className="border-t border-red-900/30 pt-4 mt-4">
                        <p className="text-gray-300">{incident.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>NO INCIDENTS REPORTED</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
