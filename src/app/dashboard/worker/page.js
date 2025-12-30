'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  useEffect(() => {
    fetchWorkerData();
  }, []);

  useEffect(() => {
    if (activeTab === 'activity' && activities.length === 0) {
      fetchActivities();
    }
  }, [activeTab]);

  const fetchWorkerData = async () => {
    try {
      const response = await api.get('/workers/profile');
      setWorkerData(response);
      
      // Check if onboarding is complete
      if (response && !response.onboarding_completed) {
        // Show notification that onboarding is incomplete
        console.log('Onboarding incomplete');
      }
    } catch (err) {
      console.error('Error fetching worker data:', err);
      // If worker profile doesn't exist, they may need to complete onboarding
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        console.log('Worker profile not found - may need onboarding');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    setActivitiesLoading(true);
    try {
      const response = await api.get('/workers/me/activity');
      setActivities(response.activities || []);
      console.log('Activities loaded:', response.activities?.length || 0);
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const getTrustScore = (score) => {
    if (!score) return { label: 'N/A', color: 'text-gray-400', bg: 'bg-gray-900/20', border: 'border-gray-500' };
    if (score >= 80) return { label: 'HIGH', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500' };
    if (score >= 60) return { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500' };
    return { label: 'LOW', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-green-400 text-xl">⟳ LOADING DASHBOARD...</div>
      </div>
    );
  }

  // Show onboarding incomplete message if worker data is missing or incomplete
  const isOnboardingIncomplete = !workerData || workerData.onboarding_step < 6;

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} user={user} onLogout={handleLogout} />
      
      {/* Onboarding Incomplete Alert */}
      {isOnboardingIncomplete && (
        <div className="relative z-50 bg-yellow-900/20 border-b-2 border-yellow-500/50 py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-yellow-400 text-2xl">⚠</div>
              <div>
                <p className="text-yellow-400 font-bold">ONBOARDING INCOMPLETE</p>
                <p className="text-gray-400 text-sm">Please complete your onboarding to access all features</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/worker/onboarding')}
              className="bg-yellow-600 text-black font-bold py-2 px-6 rounded hover:bg-yellow-500 hover:shadow-[0_0_20px_rgba(234,179,8,0.8)] transition-all"
            >
              COMPLETE ONBOARDING →
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
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-green-400">// WORKER_DASHBOARD</h1>
          <p className="text-xs text-gray-400 mt-1">IDENTITY MANAGEMENT SYSTEM</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* Trust Score */}
          <div className={`p-6 rounded-lg border-2 ${getTrustScore(workerData?.trust_score).border} ${getTrustScore(workerData?.trust_score).bg}`}>
            <div className="text-xs text-gray-400 mb-2">TRUST SCORE</div>
            <div className={`text-4xl font-bold ${getTrustScore(workerData?.trust_score).color}`}>
              {workerData?.trust_score || 'N/A'}
            </div>
            <div className={`text-xs font-bold mt-2 ${getTrustScore(workerData?.trust_score).color}`}>
              {getTrustScore(workerData?.trust_score).label}
            </div>
          </div>

          {/* Verification Status */}
          <div className={`p-6 rounded-lg border-2 ${
            workerData?.verification_status === 'verified'
              ? 'border-green-500 bg-green-900/20'
              : workerData?.verification_status === 'rejected'
              ? 'border-red-500 bg-red-900/20'
              : 'border-yellow-500 bg-yellow-900/20'
          }`}>
            <div className="text-xs text-gray-400 mb-2">POLICE VERIFICATION</div>
            <div className={`text-2xl font-bold uppercase ${
              workerData?.verification_status === 'verified' ? 'text-green-400' :
              workerData?.verification_status === 'rejected' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              {workerData?.verification_status === 'verified' ? 'VERIFIED' :
               workerData?.verification_status === 'rejected' ? 'REJECTED' :
               'PENDING'}
            </div>
          </div>

          {/* Companies */}
          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">COMPANIES</div>
            <div className="text-4xl font-bold text-green-400">
              {workerData?.companies?.length || 0}
            </div>
            <div className="text-xs text-gray-400 mt-2">ASSOCIATED</div>
          </div>

          {/* Incidents */}
          <div className={`p-6 rounded-lg border-2 ${
            workerData?.incidents?.length > 0
              ? 'border-red-500 bg-red-900/20'
              : 'border-green-500/50 bg-green-900/10'
          }`}>
            <div className="text-xs text-gray-400 mb-2">INCIDENTS</div>
            <div className={`text-4xl font-bold ${
              workerData?.incidents?.length > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {workerData?.incidents?.length || 0}
            </div>
            <div className="text-xs text-gray-400 mt-2">REPORTED</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-green-900/30">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'profile'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              PROFILE
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'companies'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              COMPANIES
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'verification'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              VERIFICATION
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'qr'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              QR CODE
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'activity'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              ACTIVITY
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">WORKER PROFILE</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="text-white text-lg">{workerData?.full_name || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Worker ID
                  </label>
                  <div className={`text-lg font-mono ${
                    workerData?.worker_id_status === 'verified' 
                      ? 'text-green-400' 
                      : workerData?.worker_id_status === 'pending'
                      ? 'text-yellow-400 italic'
                      : 'text-gray-400 italic'
                  }`}>
                    {workerData?.worker_id || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Category
                  </label>
                  <div className="text-white text-lg uppercase">{workerData?.category || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <div className="text-white text-lg">{workerData?.mobile || 'N/A'}</div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Current Address
                  </label>
                  <div className="text-white">{workerData?.address_current || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    City
                  </label>
                  <div className="text-white">{workerData?.city || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    State
                  </label>
                  <div className="text-white">{workerData?.state || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Companies Tab */}
          {activeTab === 'companies' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">ASSOCIATED COMPANIES</h2>
              
              {workerData?.companies && workerData.companies.length > 0 ? (
                <div className="space-y-4">
                  {workerData.companies.map((company, idx) => (
                    <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{company.name}</h3>
                          <div className="text-sm text-gray-400">ID: {company.id}</div>
                          {company.gstin && (
                            <div className="text-sm text-gray-400 mt-1">GSTIN: {company.gstin}</div>
                          )}
                        </div>
                        <div className="text-xs text-green-400 bg-green-900/20 px-3 py-1 rounded border border-green-500/50">
                          ACTIVE
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p>NO COMPANIES ASSOCIATED YET</p>
                </div>
              )}
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">VERIFICATION STATUS</h2>
              
              <div className="space-y-4">
                
                {/* Police Verification */}
                <div className={`p-6 rounded-lg border-2 ${
                  workerData?.verification_status === 'verified'
                    ? 'border-green-500 bg-green-900/20'
                    : workerData?.verification_status === 'rejected'
                    ? 'border-red-500 bg-red-900/20'
                    : 'border-yellow-500 bg-yellow-900/20'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">POLICE VERIFICATION</h3>
                      <p className="text-sm text-gray-400">Background check by law enforcement</p>
                    </div>
                    <div className={`text-xl font-bold uppercase ${
                      workerData?.verification_status === 'verified' ? 'text-green-400' :
                      workerData?.verification_status === 'rejected' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {workerData?.verification_status === 'verified' ? 'VERIFIED' :
                       workerData?.verification_status === 'rejected' ? 'REJECTED' :
                       'PENDING'}
                    </div>
                  </div>
                </div>

                {/* Face Verification */}
                <div className={`p-6 rounded-lg border-2 ${
                  workerData?.face_verification_status === 'verified'
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-yellow-500 bg-yellow-900/20'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">FACE VERIFICATION</h3>
                      <p className="text-sm text-gray-400">Biometric facial recognition</p>
                    </div>
                    <div className={`text-xl font-bold uppercase ${
                      workerData?.face_verification_status === 'verified' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {workerData?.face_verification_status || 'PENDING'}
                    </div>
                  </div>
                </div>

                {/* Onboarding */}
                <div className={`p-6 rounded-lg border-2 ${
                  workerData?.onboarding_step === 6
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-yellow-500 bg-yellow-900/20'
                }`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">ONBOARDING</h3>
                      <p className="text-sm text-gray-400">Registration process completion</p>
                    </div>
                    <div className={`text-xl font-bold uppercase ${
                      workerData?.onboarding_step === 6 ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {workerData?.onboarding_step === 6 ? 'COMPLETED' : `STEP ${workerData?.onboarding_step || 0}/6`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">WORKER QR CODE</h2>
              
              {workerData?.qr_code_url ? (
                <div className="text-center">
                  <div className="inline-block p-8 bg-white rounded-lg">
                    <img 
                      src={`http://localhost:8000/${workerData.qr_code_url}`} 
                      alt="Worker QR Code" 
                      className="w-64 h-64"
                      onError={(e) => {
                        console.error('QR Code image failed to load:', e);
                        console.log('Attempted URL:', e.target.src);
                      }}
                    />
                  </div>
                  <p className="mt-6 text-gray-400">
                    → SCAN THIS CODE FOR INSTANT VERIFICATION
                  </p>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `http://localhost:8000/${workerData.qr_code_url}`;
                      link.download = `Worker-QR-${workerData.worker_id}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="mt-4 bg-green-600 text-black font-bold py-2 px-6 rounded hover:bg-green-500 transition-all"
                  >
                    DOWNLOAD QR CODE
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p>QR CODE NOT GENERATED YET</p>
                  <p className="text-sm mt-2">COMPLETE VERIFICATION TO GET YOUR QR CODE</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">MY ACTIVITY (Last 2 Weeks)</h2>
              
              {activitiesLoading ? (
                <div className="text-center py-12">
                  <div className="text-green-400 text-xl">⟳ LOADING ACTIVITIES...</div>
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity, idx) => (
                    <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:border-green-500/50 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          {/* Delivery Worker Activity */}
                          {activity.activity_type === 'delivery' && (
                            <>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">📦</span>
                                <div>
                                  <h3 className="text-xl font-bold text-white">{activity.package_id} - {activity.package_type}</h3>
                                  <p className="text-sm text-gray-400">{activity.delivery_partner}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-400">Recipient:</span>
                                  <span className="text-white ml-2">{activity.recipient_name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Contact:</span>
                                  <span className="text-white ml-2">{activity.recipient_contact}</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="text-gray-400">📍 Location:</span>
                                  <span className="text-white ml-2">{activity.location}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Date:</span>
                                  <span className="text-white ml-2">{new Date(activity.activity_date).toLocaleString()}</span>
                                </div>
                              </div>
                            </>
                          )}
                          
                          {/* AePS Agent Activity */}
                          {activity.activity_type === 'transaction' && (
                            <>
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">💰</span>
                                <div>
                                  <h3 className="text-xl font-bold text-white">{activity.transaction_type}</h3>
                                  {activity.transaction_amount && (
                                    <p className="text-lg text-green-400 font-bold">₹{activity.transaction_amount.toLocaleString()}</p>
                                  )}
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-400">Customer:</span>
                                  <span className="text-white ml-2">{activity.customer_name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Contact:</span>
                                  <span className="text-white ml-2">{activity.customer_contact}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Bank:</span>
                                  <span className="text-white ml-2">{activity.bank_name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400">Date:</span>
                                  <span className="text-white ml-2">{new Date(activity.activity_date).toLocaleString()}</span>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="text-gray-400">📍 Location:</span>
                                  <span className="text-white ml-2">{activity.location}</span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className={`text-xs px-3 py-1 rounded border ${
                            activity.status === 'completed' 
                              ? 'text-green-400 bg-green-900/20 border-green-500/50'
                              : 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50'
                          }`}>
                            {activity.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      {activity.notes && (
                        <div className="mt-3 pt-3 border-t border-green-900/30">
                          <p className="text-sm text-gray-400">📝 {activity.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>NO ACTIVITIES FOUND</p>
                  <p className="text-sm mt-2">Your work activities from the last 2 weeks will appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
