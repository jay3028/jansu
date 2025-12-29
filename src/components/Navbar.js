'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar({ showAuth = true, user = null, onLogout = null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If user not passed as prop, try to get from localStorage
    if (!user && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error loading user:', err);
      }
    } else {
      setCurrentUser(user);
    }
  }, [user]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
      router.push('/auth/login');
    }
  };

  const isHomePage = pathname === '/';
  const isAuthPage = pathname?.startsWith('/auth/');

  return (
    <nav className="relative z-50 border-b border-green-500/30 bg-black/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-3 h-3 bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e] rounded-full"></div>
            <span className="text-lg font-bold tracking-widest text-white">
              JAN<span className="text-green-500">_SURAKSHA</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Navigation Links */}
            {!isHomePage && (
              <Link
                href="/"
                className="text-green-400 hover:text-green-300 font-bold text-sm transition-colors"
              >
                HOME
              </Link>
            )}

            {!isAuthPage && (
              <Link
                href="/verify"
                className="text-green-400 hover:text-green-300 font-bold text-sm transition-colors"
              >
                VERIFY WORKER
              </Link>
            )}

            {/* User Info & Auth */}
            {showAuth && (
              <>
                {currentUser ? (
                  <div className="flex items-center gap-4">
                    {/* User Info */}
                    <div className="text-right border-l border-green-500/30 pl-4">
                      <div className="text-sm text-white font-bold">{currentUser.full_name || 'USER'}</div>
                      <div className="text-xs text-green-400 uppercase">{currentUser.role || 'N/A'}</div>
                      {currentUser.email && (
                        <div className="text-xs text-gray-400">{currentUser.email}</div>
                      )}
                    </div>

                    {/* Dashboard Link */}
                    {!pathname?.includes('/dashboard') && (
                      <Link
                        href={
                          currentUser.role === 'worker' || currentUser.role === 'delivery_worker' || currentUser.role === 'aeps_agent'
                            ? '/dashboard/worker'
                            : currentUser.role === 'company' || currentUser.role === 'provider'
                            ? '/dashboard/company'
                            : currentUser.role === 'bank'
                            ? '/dashboard/bank'
                            : currentUser.role === 'police'
                            ? '/dashboard/police'
                            : currentUser.role === 'admin'
                            ? '/dashboard/admin'
                            : '/dashboard/worker'
                        }
                        className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all text-sm"
                      >
                        DASHBOARD
                      </Link>
                    )}

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-2 rounded hover:bg-red-900/40 transition-all text-sm font-bold"
                    >
                      LOGOUT
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/auth/login"
                      className="text-green-400 hover:text-green-300 font-bold text-sm transition-colors"
                    >
                      LOGIN
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all text-sm"
                    >
                      SIGN UP
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* System Time */}
            <div className="text-xs text-green-600/70 font-mono border-l border-green-500/30 pl-4">
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-green-400 hover:text-green-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-green-500/30 space-y-3">
            
            {!isHomePage && (
              <Link
                href="/"
                className="block text-green-400 hover:text-green-300 font-bold text-sm transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                HOME
              </Link>
            )}

            {!isAuthPage && (
              <Link
                href="/verify"
                className="block text-green-400 hover:text-green-300 font-bold text-sm transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                VERIFY WORKER
              </Link>
            )}

            {showAuth && (
              <>
                {currentUser ? (
                  <>
                    <div className="border border-green-500/30 rounded p-3 bg-green-900/10">
                      <div className="text-sm text-white font-bold">{currentUser.full_name || 'USER'}</div>
                      <div className="text-xs text-green-400 uppercase mt-1">{currentUser.role || 'N/A'}</div>
                      {currentUser.email && (
                        <div className="text-xs text-gray-400 mt-1">{currentUser.email}</div>
                      )}
                    </div>

                    {!pathname?.includes('/dashboard') && (
                      <Link
                        href={
                          currentUser.role === 'worker' || currentUser.role === 'delivery_worker' || currentUser.role === 'aeps_agent'
                            ? '/dashboard/worker'
                            : currentUser.role === 'company' || currentUser.role === 'provider'
                            ? '/dashboard/company'
                            : currentUser.role === 'bank'
                            ? '/dashboard/bank'
                            : currentUser.role === 'police'
                            ? '/dashboard/police'
                            : currentUser.role === 'admin'
                            ? '/dashboard/admin'
                            : '/dashboard/worker'
                        }
                        className="block bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        DASHBOARD
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-2 rounded hover:bg-red-900/40 transition-all text-sm font-bold"
                    >
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block text-green-400 hover:text-green-300 font-bold text-sm transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      LOGIN
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      SIGN UP
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

