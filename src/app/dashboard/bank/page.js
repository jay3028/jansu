'use client';

// Bank Dashboard - Similar to Company Dashboard with AePS focus
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function BankDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bank, setBank] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'bank') {
      router.push('/');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [bankData, agentsData] = await Promise.all([
        api.getMyProvider(),
        api.getMyWorkers()
      ]);
      setBank(bankData);
      setAgents(agentsData.workers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      <div className="relative z-10 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-400">// BANK_DASHBOARD</h1>
            <p className="text-xs text-gray-400 mt-1">AePS AGENT MANAGEMENT SYSTEM</p>
          </div>
          <Link
            href="/dashboard/bank/aeps"
            className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm"
          >
            AePS AGENTS
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">TOTAL AePS AGENTS</div>
            <div className="text-4xl font-bold text-green-400">{agents.length}</div>
            <div className="text-xs text-gray-400 mt-2">REGISTERED</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">VERIFIED</div>
            <div className="text-4xl font-bold text-green-400">
              {agents.filter(a => a.police_verification_status === 'approved').length}
            </div>
            <div className="text-xs text-gray-400 mt-2">AGENTS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-yellow-500/50 bg-yellow-900/10">
            <div className="text-xs text-gray-400 mb-2">PENDING</div>
            <div className="text-4xl font-bold text-yellow-400">
              {agents.filter(a => a.police_verification_status === 'pending').length}
            </div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATION</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">API KEY</div>
            <div className="text-lg font-bold text-green-400">
              {bank?.api_key ? '✓ ACTIVE' : '✗ NONE'}
            </div>
            <div className="text-xs text-gray-400 mt-2">STATUS</div>
          </div>
        </div>

        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <h2 className="text-2xl font-bold text-green-400 mb-6">AePS AGENTS</h2>
          
          {agents.length > 0 ? (
            <div className="space-y-4">
              {agents.map((agent, idx) => (
                <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{agent.full_name}</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Agent ID:</span>
                          <span className="text-white ml-2 font-mono">{agent.id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Mobile:</span>
                          <span className="text-white ml-2">{agent.mobile || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Service Region:</span>
                          <span className="text-white ml-2">{agent.service_region || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Trust Score:</span>
                          <span className={`ml-2 font-bold ${
                            agent.trust_score >= 80 ? 'text-green-400' :
                            agent.trust_score >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>{agent.trust_score || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs px-3 py-1 rounded border ${
                      agent.police_verification_status === 'approved'
                        ? 'text-green-400 bg-green-900/20 border-green-500/50'
                        : 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50'
                    }`}>
                      {agent.police_verification_status?.toUpperCase() || 'PENDING'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>NO AePS AGENTS REGISTERED YET</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
