'use client';

import { useState } from 'react';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function VerifyPage() {
  const [searchMethod, setSearchMethod] = useState('qr');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workerData, setWorkerData] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setWorkerData(null);

    try {
      let response;
      if (searchMethod === 'qr') {
        response = await api.get(`/verify/worker/qr/${searchValue}`);
      } else if (searchMethod === 'mobile') {
        response = await api.get(`/verify/worker/mobile/${searchValue}`);
      } else if (searchMethod === 'id') {
        response = await api.get(`/verify/worker/${searchValue}`);
      }

      setWorkerData(response);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const getTrustScore = (score) => {
    if (score >= 80) return { label: 'HIGH', color: 'text-green-400', bg: 'bg-green-900/20', border: 'border-green-500' };
    if (score >= 60) return { label: 'MEDIUM', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-500' };
    return { label: 'LOW', color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-500' };
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} />
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      {/* Header */}
      <div className="relative z-10 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e] rounded-full"></div>
            <h1 className="text-3xl font-bold text-green-400">// WORKER_VERIFICATION_SYSTEM</h1>
          </div>
          <p className="text-gray-400 text-sm">PUBLIC IDENTITY VERIFICATION INTERFACE</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        
        {/* Search Form */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)] mb-8">
          <form onSubmit={handleVerify} className="space-y-6">
            
            {/* Search Method */}
            <div>
              <label className="block text-green-400 text-sm font-bold mb-3 uppercase tracking-wider">
                Verification Method
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSearchMethod('qr')}
                  className={`p-4 rounded border-2 transition-all ${
                    searchMethod === 'qr'
                      ? 'border-green-500 bg-green-900/20 text-green-400'
                      : 'border-green-500/30 bg-black text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <span className="text-sm font-bold">QR CODE</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchMethod('mobile')}
                  className={`p-4 rounded border-2 transition-all ${
                    searchMethod === 'mobile'
                      ? 'border-green-500 bg-green-900/20 text-green-400'
                      : 'border-green-500/30 bg-black text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-bold">MOBILE NUMBER</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchMethod('id')}
                  className={`p-4 rounded border-2 transition-all ${
                    searchMethod === 'id'
                      ? 'border-green-500 bg-green-900/20 text-green-400'
                      : 'border-green-500/30 bg-black text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <span className="text-sm font-bold">WORKER ID</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                {searchMethod === 'qr' && 'QR Code Data'}
                {searchMethod === 'mobile' && 'Mobile Number'}
                {searchMethod === 'id' && 'Worker ID'}
              </label>
              <input
                type="text"
                required
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                placeholder={
                  searchMethod === 'qr' ? 'SCAN OR ENTER QR CODE' :
                  searchMethod === 'mobile' ? '+91XXXXXXXXXX' :
                  'WORKER-ID-XXXXX'
                }
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded p-4">
                <p className="text-red-400 text-sm">✗ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded uppercase tracking-widest hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50"
            >
              {loading ? '⟳ VERIFYING...' : '→ VERIFY WORKER'}
            </button>
          </form>
        </div>

        {/* Worker Data Display */}
        {workerData && (
          <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-green-900/30">
              <div>
                <h2 className="text-2xl font-bold text-green-400">WORKER PROFILE</h2>
                <p className="text-gray-400 text-sm mt-1">VERIFIED IDENTITY DATA</p>
              </div>
              {workerData.trust_score && (
                <div className={`px-6 py-3 rounded border-2 ${getTrustScore(workerData.trust_score).border} ${getTrustScore(workerData.trust_score).bg}`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getTrustScore(workerData.trust_score).color}`}>
                      {workerData.trust_score}
                    </div>
                    <div className={`text-xs font-bold mt-1 ${getTrustScore(workerData.trust_score).color}`}>
                      TRUST SCORE
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Worker Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="text-white text-lg">{workerData.full_name || 'N/A'}</div>
              </div>

              <div>
                <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                  Worker ID
                </label>
                <div className="text-white text-lg font-mono">{workerData.id || 'N/A'}</div>
              </div>

              <div>
                <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                  Category
                </label>
                <div className="text-white text-lg uppercase">{workerData.category || 'N/A'}</div>
              </div>

              <div>
                <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                  Mobile Number
                </label>
                <div className="text-white text-lg">{workerData.mobile || 'N/A'}</div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                  Current Address
                </label>
                <div className="text-white">{workerData.address_current || 'N/A'}</div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="border-t border-green-900/30 pt-6 mt-6">
              <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Verification Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className={`p-4 rounded border-2 ${
                  workerData.police_verification_status === 'approved'
                    ? 'border-green-500 bg-green-900/20'
                    : workerData.police_verification_status === 'pending'
                    ? 'border-yellow-500 bg-yellow-900/20'
                    : 'border-red-500 bg-red-900/20'
                }`}>
                  <div className="text-xs text-gray-400 mb-1">POLICE VERIFICATION</div>
                  <div className={`font-bold uppercase ${
                    workerData.police_verification_status === 'approved' ? 'text-green-400' :
                    workerData.police_verification_status === 'pending' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {workerData.police_verification_status || 'PENDING'}
                  </div>
                </div>

                <div className={`p-4 rounded border-2 ${
                  workerData.face_verification_status === 'verified'
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-yellow-500 bg-yellow-900/20'
                }`}>
                  <div className="text-xs text-gray-400 mb-1">FACE VERIFICATION</div>
                  <div className={`font-bold uppercase ${
                    workerData.face_verification_status === 'verified' ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {workerData.face_verification_status || 'PENDING'}
                  </div>
                </div>

                <div className={`p-4 rounded border-2 ${
                  workerData.onboarding_completed
                    ? 'border-green-500 bg-green-900/20'
                    : 'border-yellow-500 bg-yellow-900/20'
                }`}>
                  <div className="text-xs text-gray-400 mb-1">ONBOARDING</div>
                  <div className={`font-bold uppercase ${
                    workerData.onboarding_completed ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {workerData.onboarding_completed ? 'COMPLETED' : 'IN PROGRESS'}
                  </div>
                </div>
              </div>
            </div>

            {/* Companies */}
            {workerData.companies && workerData.companies.length > 0 && (
              <div className="border-t border-green-900/30 pt-6 mt-6">
                <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Associated Companies</h3>
                <div className="space-y-2">
                  {workerData.companies.map((company, idx) => (
                    <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded p-3">
                      <div className="text-white font-bold">{company.name}</div>
                      <div className="text-xs text-gray-400 mt-1">ID: {company.id}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Incidents */}
            {workerData.incidents && workerData.incidents.length > 0 && (
              <div className="border-t border-green-900/30 pt-6 mt-6">
                <h3 className="text-red-400 font-bold mb-4 uppercase tracking-wider">⚠ Reported Incidents</h3>
                <div className="space-y-2">
                  {workerData.incidents.map((incident, idx) => (
                    <div key={idx} className="bg-red-900/20 border border-red-500/50 rounded p-3">
                      <div className="text-red-400 font-bold">{incident.incident_type}</div>
                      <div className="text-xs text-gray-400 mt-1">{incident.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(incident.incident_date).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code */}
            {workerData.qr_code_url && (
              <div className="border-t border-green-900/30 pt-6 mt-6 text-center">
                <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Worker QR Code</h3>
                <div className="inline-block p-4 bg-white rounded">
                  <img src={workerData.qr_code_url} alt="Worker QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
