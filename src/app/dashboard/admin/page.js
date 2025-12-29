'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
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
            <h1 className="text-2xl font-bold text-green-400">// ADMIN_DASHBOARD</h1>
            <p className="text-xs text-gray-400 mt-1">SYSTEM ADMINISTRATION CONTROL PANEL</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin/users"
              className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm"
            >
              MANAGE USERS
            </Link>
            <Link
              href="/dashboard/admin/audit"
              className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm"
            >
              AUDIT LOGS
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">TOTAL USERS</div>
            <div className="text-4xl font-bold text-green-400">{stats?.total_users || 0}</div>
            <div className="text-xs text-gray-400 mt-2">REGISTERED</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">WORKERS</div>
            <div className="text-4xl font-bold text-green-400">{stats?.total_workers || 0}</div>
            <div className="text-xs text-gray-400 mt-2">ONBOARDED</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">COMPANIES</div>
            <div className="text-4xl font-bold text-green-400">{stats?.total_companies || 0}</div>
            <div className="text-xs text-gray-400 mt-2">REGISTERED</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-yellow-500/50 bg-yellow-900/10">
            <div className="text-xs text-gray-400 mb-2">PENDING</div>
            <div className="text-4xl font-bold text-yellow-400">{stats?.pending_verifications || 0}</div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATIONS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">APPROVED</div>
            <div className="text-4xl font-bold text-green-400">{stats?.approved_verifications || 0}</div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATIONS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-red-500/50 bg-red-900/10">
            <div className="text-xs text-gray-400 mb-2">REJECTED</div>
            <div className="text-4xl font-bold text-red-400">{stats?.rejected_verifications || 0}</div>
            <div className="text-xs text-gray-400 mt-2">VERIFICATIONS</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-red-500/50 bg-red-900/10">
            <div className="text-xs text-gray-400 mb-2">INCIDENTS</div>
            <div className="text-4xl font-bold text-red-400">{stats?.total_incidents || 0}</div>
            <div className="text-xs text-gray-400 mt-2">REPORTED</div>
          </div>

          <div className="p-6 rounded-lg border-2 border-green-500/50 bg-green-900/10">
            <div className="text-xs text-gray-400 mb-2">COMPLAINTS</div>
            <div className="text-4xl font-bold text-green-400">{stats?.total_complaints || 0}</div>
            <div className="text-xs text-gray-400 mt-2">FILED</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)] mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-6">QUICK ACTIONS</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <Link
              href="/dashboard/admin/users"
              className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-900/20 hover:border-green-500/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white">MANAGE USERS</h3>
                  <p className="text-xs text-gray-400 mt-1">View and manage all users</p>
                </div>
              </div>
            </Link>

            <Link
              href="/dashboard/admin/audit"
              className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-900/20 hover:border-green-500/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white">AUDIT LOGS</h3>
                  <p className="text-xs text-gray-400 mt-1">View system audit trail</p>
                </div>
              </div>
            </Link>

            <button
              onClick={() => alert('Feature coming soon!')}
              className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-900/20 hover:border-green-500/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white">SYSTEM SETTINGS</h3>
                  <p className="text-xs text-gray-400 mt-1">Configure system parameters</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => alert('Feature coming soon!')}
              className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-900/20 hover:border-green-500/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white">REPORTS</h3>
                  <p className="text-xs text-gray-400 mt-1">Generate system reports</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => alert('Feature coming soon!')}
              className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-900/20 hover:border-green-500/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white">COMPANIES</h3>
                  <p className="text-xs text-gray-400 mt-1">Manage service providers</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => alert('Feature coming soon!')}
              className="bg-green-900/10 border border-green-500/30 rounded-lg p-6 hover:bg-green-900/20 hover:border-green-500/50 transition-all group text-left"
            >
              <div className="flex items-center gap-4">
                <svg className="w-12 h-12 text-green-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-lg font-bold text-white">INCIDENTS</h3>
                  <p className="text-xs text-gray-400 mt-1">Review reported incidents</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <h2 className="text-2xl font-bold text-green-400 mb-6">SYSTEM STATUS</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-900/10 border border-green-500/30 rounded">
              <div>
                <h3 className="text-white font-bold">DATABASE</h3>
                <p className="text-xs text-gray-400 mt-1">MySQL Connection</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-green-400 font-bold">ONLINE</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-900/10 border border-green-500/30 rounded">
              <div>
                <h3 className="text-white font-bold">API SERVER</h3>
                <p className="text-xs text-gray-400 mt-1">FastAPI Backend</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-green-400 font-bold">ONLINE</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-900/10 border border-green-500/30 rounded">
              <div>
                <h3 className="text-white font-bold">AWS REKOGNITION</h3>
                <p className="text-xs text-gray-400 mt-1">Face Verification Service</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-green-400 font-bold">ONLINE</span>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-900/10 border border-green-500/30 rounded">
              <div>
                <h3 className="text-white font-bold">EMAIL SERVICE</h3>
                <p className="text-xs text-gray-400 mt-1">SMTP / OTP Delivery</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-green-400 font-bold">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
