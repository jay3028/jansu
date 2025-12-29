'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchAgent();
    }
  }, [params.id]);

  const fetchAgent = async () => {
    try {
      const response = await api.get(`/police/agent/${params.id}`);
      setAgent(response);
    } catch (err) {
      setError(err.message || 'Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-green-400 text-xl">⟳ LOADING AGENT DATA...</div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">✗ {error || 'Agent not found'}</p>
          <Link
            href="/dashboard/police/search"
            className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all"
          >
            ← BACK TO SEARCH
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-green-400">// AGENT_DETAILS</h1>
            <p className="text-xs text-gray-400 mt-1">WORKER PROFILE & VERIFICATION DATA</p>
          </div>
          <Link
            href="/dashboard/police/search"
            className="bg-gray-800 text-green-400 font-bold py-2 px-4 rounded border border-green-500/30 hover:bg-gray-700 transition-all text-sm"
          >
            ← BACK TO SEARCH
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-green-900/30">
            <div>
              <h2 className="text-3xl font-bold text-white">{agent.full_name}</h2>
              <p className="text-gray-400 mt-1">ID: {agent.id}</p>
            </div>
            {agent.trust_score && (
              <div className={`px-6 py-3 rounded border-2 ${
                agent.trust_score >= 80 ? 'border-green-500 bg-green-900/20' :
                agent.trust_score >= 60 ? 'border-yellow-500 bg-yellow-900/20' :
                'border-red-500 bg-red-900/20'
              }`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    agent.trust_score >= 80 ? 'text-green-400' :
                    agent.trust_score >= 60 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {agent.trust_score}
                  </div>
                  <div className="text-xs font-bold mt-1 text-gray-400">TRUST SCORE</div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Category
              </label>
              <div className="text-white text-lg uppercase">{agent.category || 'N/A'}</div>
            </div>

            <div>
              <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Mobile Number
              </label>
              <div className="text-white text-lg">{agent.mobile || 'N/A'}</div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                Current Address
              </label>
              <div className="text-white">{agent.address_current || 'N/A'}</div>
            </div>

            <div>
              <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                City
              </label>
              <div className="text-white">{agent.city || 'N/A'}</div>
            </div>

            <div>
              <label className="block text-green-400 text-xs font-bold mb-2 uppercase tracking-wider">
                State
              </label>
              <div className="text-white">{agent.state || 'N/A'}</div>
            </div>
          </div>

          <div className="border-t border-green-900/30 pt-6 mt-6">
            <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Verification Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded border-2 ${
                agent.police_verification_status === 'approved'
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-yellow-500 bg-yellow-900/20'
              }`}>
                <div className="text-xs text-gray-400 mb-1">POLICE VERIFICATION</div>
                <div className={`font-bold uppercase ${
                  agent.police_verification_status === 'approved' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {agent.police_verification_status || 'PENDING'}
                </div>
              </div>

              <div className={`p-4 rounded border-2 ${
                agent.face_verification_status === 'verified'
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-yellow-500 bg-yellow-900/20'
              }`}>
                <div className="text-xs text-gray-400 mb-1">FACE VERIFICATION</div>
                <div className={`font-bold uppercase ${
                  agent.face_verification_status === 'verified' ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {agent.face_verification_status || 'PENDING'}
                </div>
              </div>

              <div className={`p-4 rounded border-2 ${
                agent.onboarding_completed
                  ? 'border-green-500 bg-green-900/20'
                  : 'border-yellow-500 bg-yellow-900/20'
              }`}>
                <div className="text-xs text-gray-400 mb-1">ONBOARDING</div>
                <div className={`font-bold uppercase ${
                  agent.onboarding_completed ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {agent.onboarding_completed ? 'COMPLETED' : 'IN PROGRESS'}
                </div>
              </div>
            </div>
          </div>

          {agent.companies && agent.companies.length > 0 && (
            <div className="border-t border-green-900/30 pt-6 mt-6">
              <h3 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Associated Companies</h3>
              <div className="space-y-2">
                {agent.companies.map((company, idx) => (
                  <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded p-3">
                    <div className="text-white font-bold">{company.name}</div>
                    <div className="text-xs text-gray-400 mt-1">ID: {company.id}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {agent.incidents && agent.incidents.length > 0 && (
            <div className="border-t border-green-900/30 pt-6 mt-6">
              <h3 className="text-red-400 font-bold mb-4 uppercase tracking-wider">⚠ Reported Incidents</h3>
              <div className="space-y-2">
                {agent.incidents.map((incident, idx) => (
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
        </div>
      </div>
    </div>
  );
}
