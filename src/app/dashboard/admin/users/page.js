'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-green-400 text-xl">⟳ LOADING USERS...</div>
      </div>
    );
  }

  const filteredUsers = filter === 'all' ? users : users.filter(u => u.role === filter);

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
            <h1 className="text-2xl font-bold text-green-400">// USER_MANAGEMENT</h1>
            <p className="text-xs text-gray-400 mt-1">SYSTEM USER DATABASE</p>
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
        
        <div className="mb-6 flex gap-2">
          {['all', 'worker', 'company', 'police', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => setFilter(role)}
              className={`px-4 py-2 rounded font-bold uppercase text-sm transition-all ${
                filter === role
                  ? 'bg-green-600 text-black'
                  : 'bg-gray-800 text-green-400 border border-green-500/30 hover:bg-gray-700'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <h2 className="text-2xl font-bold text-green-400 mb-6">
            USERS ({filteredUsers.length})
          </h2>
          
          <div className="space-y-4">
            {filteredUsers.map((user, idx) => (
              <div key={idx} className="bg-green-900/10 border border-green-500/30 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{user.full_name}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white ml-2">{user.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Role:</span>
                        <span className="text-green-400 ml-2 uppercase font-bold">{user.role}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">User ID:</span>
                        <span className="text-white ml-2 font-mono">{user.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white ml-2">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-green-400 bg-green-900/20 px-3 py-1 rounded border border-green-500/50">
                    ACTIVE
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
