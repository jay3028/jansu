'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function AdminAuditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/audit-logs');
      setLogs(response.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-green-400 text-xl">⟳ LOADING AUDIT LOGS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} user={user} />
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      <div className="relative z-10 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-green-400">// AUDIT_LOGS</h1>
            <p className="text-xs text-gray-400 mt-1">SYSTEM ACTIVITY TRAIL</p>
          </div>
          <Link
            href="/dashboard/admin"
            className="bg-gray-800 text-green-400 font-bold py-2 px-4 rounded border border-green-500/30 hover:bg-gray-700 transition-all text-sm"
          >
            ← BACK TO DASHBOARD
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <h2 className="text-2xl font-bold text-green-400 mb-6">
            AUDIT LOGS ({logs.length})
          </h2>
          
          <div className="space-y-2">
            {logs.map((log, idx) => (
              <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded p-4 hover:bg-green-900/20 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-white font-bold">{log.action}</div>
                    <div className="text-xs text-gray-400 mt-1">{log.details}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      User ID: {log.user_id} | {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-green-400 bg-green-900/20 px-2 py-1 rounded border border-green-500/50">
                    LOG
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
