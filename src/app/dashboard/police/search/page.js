'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function PoliceSearchPage() {
  const router = useRouter();
  const [searchType, setSearchType] = useState('mobile');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults([]);

    try {
      let response;
      if (searchType === 'mobile') {
        response = await api.get(`/police/search/mobile/${searchValue}`);
      } else if (searchType === 'aadhaar') {
        response = await api.get(`/police/search/aadhaar/${searchValue}`);
      } else if (searchType === 'name') {
        response = await api.get(`/police/search/name/${searchValue}`);
      }
      setResults(response.workers || []);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      <div className="relative z-10 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-400">// AGENT_SEARCH</h1>
            <p className="text-xs text-gray-400 mt-1">WORKER/AGENT DATABASE LOOKUP</p>
          </div>
          <Link
            href="/dashboard/police"
            className="bg-gray-800 text-green-400 font-bold py-2 px-4 rounded border border-green-500/30 hover:bg-gray-700 transition-all text-sm"
          >
            ← BACK TO DASHBOARD
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)] mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-green-400 text-sm font-bold mb-3 uppercase tracking-wider">
                Search Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSearchType('mobile')}
                  className={`p-4 rounded border-2 transition-all ${
                    searchType === 'mobile'
                      ? 'border-green-500 bg-green-900/20 text-green-400'
                      : 'border-green-500/30 bg-black text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <span className="text-sm font-bold">MOBILE NUMBER</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchType('aadhaar')}
                  className={`p-4 rounded border-2 transition-all ${
                    searchType === 'aadhaar'
                      ? 'border-green-500 bg-green-900/20 text-green-400'
                      : 'border-green-500/30 bg-black text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <span className="text-sm font-bold">AADHAAR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSearchType('name')}
                  className={`p-4 rounded border-2 transition-all ${
                    searchType === 'name'
                      ? 'border-green-500 bg-green-900/20 text-green-400'
                      : 'border-green-500/30 bg-black text-gray-400 hover:border-green-500/50'
                  }`}
                >
                  <span className="text-sm font-bold">NAME</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                {searchType === 'mobile' && 'Mobile Number'}
                {searchType === 'aadhaar' && 'Aadhaar Number'}
                {searchType === 'name' && 'Worker Name'}
              </label>
              <input
                type="text"
                required
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                placeholder={
                  searchType === 'mobile' ? '+91XXXXXXXXXX' :
                  searchType === 'aadhaar' ? 'XXXX-XXXX-XXXX' :
                  'WORKER NAME'
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
              {loading ? '⟳ SEARCHING...' : '→ SEARCH DATABASE'}
            </button>
          </form>
        </div>

        {results.length > 0 && (
          <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <h2 className="text-2xl font-bold text-green-400 mb-6">SEARCH RESULTS ({results.length})</h2>
            
            <div className="space-y-4">
              {results.map((worker, idx) => (
                <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-900/20 transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{worker.full_name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Worker ID:</span>
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
                    <Link
                      href={`/dashboard/police/agent/${worker.id}`}
                      className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm"
                    >
                      VIEW DETAILS →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && searchValue && (
          <div className="bg-black border-2 border-yellow-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(234,179,8,0.2)] text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-yellow-400 text-lg font-bold">NO RESULTS FOUND</p>
            <p className="text-gray-400 mt-2">TRY A DIFFERENT SEARCH TERM</p>
          </div>
        )}
      </div>
    </div>
  );
}
