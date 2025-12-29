'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function CompanyDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showLinkWorker, setShowLinkWorker] = useState(false);
  const [workerIdToLink, setWorkerIdToLink] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'company' && user?.role !== 'provider') {
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
    setLinkLoading(true);
    try {
      await api.request(`/companies/workers/${workerIdToLink}/link`, {
        method: 'POST'
      });
      setShowLinkWorker(false);
      setWorkerIdToLink('');
      fetchData();
    } catch (error) {
      alert(error.message || 'Failed to link worker');
    } finally {
      setLinkLoading(false);
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

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} user={user} onLogout={handleLogout} />
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      {/* Page Header */}
      <div className="relative z-10 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-green-400">// COMPANY_DASHBOARD</h1>
          <p className="text-xs text-gray-400 mt-1">WORKFORCE MANAGEMENT SYSTEM</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">TOTAL WORKERS</div>
            <div className="text-4xl font-bold text-green-400">
              {workers.length}
            </div>
            <div className="text-xs text-gray-400 mt-2">LINKED</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">VERIFIED</div>
            <div className="text-4xl font-bold text-green-400">
              {workers.filter(w => w.police_verification_status === 'approved').length}
            </div>
            <div className="text-xs text-gray-400 mt-2">WORKERS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-yellow-500/50 bg-yellow-900/10">
            <div className="text-xs text-gray-400 mb-2">PENDING</div>
            <div className="text-4xl font-bold text-yellow-400">
              {workers.filter(w => w.police_verification_status === 'pending').length}
            </div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATION</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">API KEY</div>
            <div className="text-lg font-bold text-green-400">
              {company?.api_key ? '✓ ACTIVE' : '✗ NONE'}
            </div>
            <div className="text-xs text-gray-400 mt-2">STATUS</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-green-900/30">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'overview'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              OVERVIEW
            </button>
            <button
              onClick={() => setActiveTab('workers')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'workers'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              WORKERS
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-6 py-3 font-bold uppercase tracking-wider transition-all ${
                activeTab === 'api'
                  ? 'text-green-400 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              API ACCESS
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">COMPANY OVERVIEW</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Company Name
                  </label>
                  <div className="text-white text-lg">{company?.name || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Company ID
                  </label>
                  <div className="text-white text-lg font-mono">{company?.id || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    GSTIN
                  </label>
                  <div className="text-white text-lg">{company?.gstin || 'N/A'}</div>
                </div>

                <div>
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Contact Email
                  </label>
                  <div className="text-white text-lg">{company?.contact_email || 'N/A'}</div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                    Registered Address
                  </label>
                  <div className="text-white">{company?.registered_address || 'N/A'}</div>
                </div>
              </div>

              <div className="border-t border-green-900/30 pt-6 mt-6">
                <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                  {company?.capabilities && company.capabilities.length > 0 ? (
                    company.capabilities.map((cap, idx) => (
                      <span key={idx} className="bg-green-900/20 border border-green-500/50 text-green-400 px-3 py-1 rounded text-sm">
                        {cap}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">NO CAPABILITIES DEFINED</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Workers Tab */}
          {activeTab === 'workers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-400">LINKED WORKERS</h2>
                <button
                  onClick={() => setShowLinkWorker(true)}
                  className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all"
                >
                  + LINK WORKER
                </button>
              </div>

              {/* Link Worker Modal */}
              {showLinkWorker && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                    <h3 className="text-xl font-bold text-green-400 mb-4">LINK WORKER</h3>
                    <form onSubmit={handleLinkWorker} className="space-y-4">
                      <div>
                        <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                          Worker ID
                        </label>
                        <input
                          type="text"
                          required
                          value={workerIdToLink}
                          onChange={(e) => setWorkerIdToLink(e.target.value)}
                          className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                          placeholder="WORKER-ID-XXXXX"
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setShowLinkWorker(false);
                            setWorkerIdToLink('');
                          }}
                          className="flex-1 bg-gray-800 text-green-400 font-bold py-3 px-4 rounded border border-green-500/30 hover:bg-gray-700 transition-all"
                        >
                          CANCEL
                        </button>
                        <button
                          type="submit"
                          disabled={linkLoading}
                          className="flex-1 bg-green-600 text-black font-bold py-3 px-4 rounded hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50"
                        >
                          {linkLoading ? '⟳ LINKING...' : 'LINK'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {workers.length > 0 ? (
                <div className="space-y-4">
                  {workers.map((worker, idx) => (
                    <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{worker.full_name}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">ID:</span>
                              <span className="text-white ml-2 font-mono">{worker.id}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Mobile:</span>
                              <span className="text-white ml-2">{worker.mobile || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Category:</span>
                              <span className="text-white ml-2 uppercase">{worker.category || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Trust Score:</span>
                              <span className={`ml-2 font-bold ${
                                worker.trust_score >= 80 ? 'text-green-400' :
                                worker.trust_score >= 60 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>{worker.trust_score || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-xs px-3 py-1 rounded border ${
                          worker.police_verification_status === 'approved'
                            ? 'text-green-400 bg-green-900/20 border-green-500/50'
                            : worker.police_verification_status === 'pending'
                            ? 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50'
                            : 'text-red-400 bg-red-900/20 border-red-500/50'
                        }`}>
                          {worker.police_verification_status?.toUpperCase() || 'PENDING'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>NO WORKERS LINKED YET</p>
                  <p className="text-sm mt-2">CLICK "LINK WORKER" TO ADD WORKERS</p>
                </div>
              )}
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 mb-6">API ACCESS</h2>
              
              {company?.api_key ? (
                <div className="space-y-6">
                  <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
                    <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                      API Key
                    </label>
                    <div className="flex items-center gap-4">
                      <code className="flex-1 bg-black border border-green-500/50 text-green-300 px-4 py-3 rounded font-mono text-sm">
                        {company.api_key}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(company.api_key);
                          alert('API Key copied to clipboard!');
                        }}
                        className="bg-green-600 text-black font-bold py-3 px-4 rounded hover:bg-green-500 transition-all"
                      >
                        COPY
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-900/20 border border-yellow-500/50 rounded p-4">
                    <p className="text-yellow-400 text-sm">
                      ⚠ KEEP YOUR API KEY SECURE. DO NOT SHARE IT PUBLICLY.
                    </p>
                  </div>

                  <div className="border-t border-green-900/30 pt-6">
                    <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider">API Endpoints</h3>
                    <div className="space-y-3 text-sm">
                      <div className="bg-black border border-green-500/30 rounded p-3">
                        <code className="text-green-400">GET /api/verify/worker/:worker_id</code>
                        <p className="text-gray-400 mt-1">Verify worker by ID</p>
                      </div>
                      <div className="bg-black border border-green-500/30 rounded p-3">
                        <code className="text-green-400">GET /api/verify/worker/mobile/:mobile</code>
                        <p className="text-gray-400 mt-1">Verify worker by mobile number</p>
                      </div>
                      <div className="bg-black border border-green-500/30 rounded p-3">
                        <code className="text-green-400">GET /api/verify/worker/qr/:qr_data</code>
                        <p className="text-gray-400 mt-1">Verify worker by QR code</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <p>NO API KEY GENERATED</p>
                  <p className="text-sm mt-2">CONTACT ADMIN TO REQUEST API ACCESS</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
