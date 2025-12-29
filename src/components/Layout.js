/**
 * Dashboard layout component with navigation
 */
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const getNavLinks = () => {
    if (!user) return [];
    
    const baseLinks = [
      { href: '/verify', label: 'Verify Agent', roles: ['citizen'] },
    ];

    const roleLinks = {
      citizen: [
        { href: '/dashboard/citizen', label: 'Dashboard' },
        { href: '/verify', label: 'Verify Agent' },
      ],
      worker: [
        { href: '/dashboard/worker', label: 'My Profile' },
      ],
      provider: [
        { href: '/dashboard/provider', label: 'Dashboard' },
        { href: '/dashboard/provider/workers', label: 'My Workers' },
      ],
      police: [
        { href: '/dashboard/police', label: 'Dashboard' },
        { href: '/dashboard/police/search', label: 'Search Agent' },
      ],
      admin: [
        { href: '/dashboard/admin', label: 'Dashboard' },
        { href: '/dashboard/admin/users', label: 'Users' },
        { href: '/dashboard/admin/audit', label: 'Audit Logs' },
      ],
    };

    return roleLinks[user.role] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  Jan Suraksha
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {getNavLinks().map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              {user && (
                <>
                  <span className="text-sm text-gray-700 mr-4">
                    {user.full_name} ({user.role})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-700 hover:text-blue-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {title && (
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

