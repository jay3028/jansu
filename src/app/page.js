/**
 * Home / Landing Page
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Hero from '@/components/Hero';
import api from '@/services/api';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't auto-redirect logged-in users, let them see the landing page
    // They can use the navbar to navigate to their dashboard
  }, [user, loading, mounted, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-green-900 selection:text-green-100">
      {/* Hero Section - Use the Hero component (includes Navbar) */}
      <Hero />

      {/* Features Section */}
      <div className="bg-gradient-to-b from-black to-green-950/5 border-t border-green-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-12 tracking-wider uppercase">
            // PLATFORM_FEATURES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 - Unique Worker Identity */}
            <div className="p-6 bg-gradient-to-br from-green-900/5 to-green-900/10 border border-green-500/20 rounded-lg hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-3 uppercase tracking-wider">Unique Worker Identity</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every worker is issued a unique digital ID and QR code, creating a single, verified identity usable across banks and gig platforms.
              </p>
            </div>

            {/* Feature 2 - Real-Time Verification */}
            <div className="p-6 bg-gradient-to-br from-green-900/5 to-green-900/10 border border-green-500/20 rounded-lg hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-3 uppercase tracking-wider">Real-Time Verification</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Citizens, companies, and police can instantly verify a worker by scanning the QR or entering the ID—no delays, no guesswork.
              </p>
            </div>

            {/* Feature 3 - Digitized Police Verification */}
            <div className="p-6 bg-gradient-to-br from-green-900/5 to-green-900/10 border border-green-500/20 rounded-lg hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-3 uppercase tracking-wider">Digitized Police Verification</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Police verification is digitally recorded, standardized, and time-bound, with real-time status and automatic expiry alerts.
              </p>
            </div>

            {/* Feature 4 - Live Status Control */}
            <div className="p-6 bg-gradient-to-br from-green-900/5 to-green-900/10 border border-green-500/20 rounded-lg hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-3 uppercase tracking-wider">Live Status Control</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Banks and platforms can activate, deactivate, or suspend workers instantly, with status updates reflected in real time.
              </p>
            </div>

            {/* Feature 5 - Anti-Impersonation Protection */}
            <div className="p-6 bg-gradient-to-br from-green-900/5 to-green-900/10 border border-green-500/20 rounded-lg hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-3 uppercase tracking-wider">Anti-Impersonation Protection</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Live selfie capture and photo matching ensure only the genuine worker can register and operate—no fake IDs, no reuse.
              </p>
            </div>

            {/* Feature 6 - Privacy By Design */}
            <div className="p-6 bg-gradient-to-br from-green-900/5 to-green-900/10 border border-green-500/20 rounded-lg hover:border-green-500/40 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-3 uppercase tracking-wider">Privacy By Design</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                No raw Aadhaar storage, no continuous tracking—only purpose-limited, role-based access, fully compliant with Indian laws.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-black border-t border-green-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-12 uppercase tracking-wider">
            // HOW_IT_WORKS
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)] border-2 border-green-400">
                <span className="text-2xl font-bold text-black">1</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">Register & Onboard</h3>
              <p className="text-gray-400 text-sm">
                Workers and providers register on the platform. Workers get a unique 
                Universal Agent ID and QR code for verification.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)] border-2 border-green-400">
                <span className="text-2xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">Verify Instantly</h3>
              <p className="text-gray-400 text-sm">
                Citizens can verify agents in real-time by scanning QR codes, 
                entering phone numbers, or using Universal Agent IDs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.5)] border-2 border-green-400">
                <span className="text-2xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">Stay Safe</h3>
              <p className="text-gray-400 text-sm">
                Get instant trust status with color-coded results. 
                Risk scores and police verification ensure your safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="bg-black border-t border-green-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-12 uppercase tracking-wider">
            // FOR_EVERYONE
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-green-500/30 bg-green-900/10 rounded-lg p-6 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <h3 className="text-lg font-bold text-green-400 mb-2 uppercase tracking-wider">👤 Citizens</h3>
              <p className="text-gray-400 text-sm">
                Verify delivery agents and AePS operators before transactions. 
                Get instant trust status and safety information.
              </p>
            </div>

            <div className="border border-green-500/30 bg-green-900/10 rounded-lg p-6 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <h3 className="text-lg font-bold text-green-400 mb-2 uppercase tracking-wider">🚚 Workers</h3>
              <p className="text-gray-400 text-sm">
                Get verified and build trust. Display your QR code to customers 
                for instant verification and credibility.
              </p>
            </div>

            <div className="border border-green-500/30 bg-green-900/10 rounded-lg p-6 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <h3 className="text-lg font-bold text-green-400 mb-2 uppercase tracking-wider">🏢 Providers</h3>
              <p className="text-gray-400 text-sm">
                Onboard and manage your delivery workers. Monitor their status, 
                risk scores, and compliance.
              </p>
            </div>

            <div className="border border-green-500/30 bg-green-900/10 rounded-lg p-6 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <h3 className="text-lg font-bold text-green-400 mb-2 uppercase tracking-wider">🏦 Banks</h3>
              <p className="text-gray-400 text-sm">
                Ensure transaction safety with intent verification before biometric. 
                Detect and prevent fraud attempts.
              </p>
            </div>

            <div className="border border-green-500/30 bg-green-900/10 rounded-lg p-6 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <h3 className="text-lg font-bold text-green-400 mb-2 uppercase tracking-wider">👮 Police</h3>
              <p className="text-gray-400 text-sm">
                Verify agents, log incidents, and maintain law enforcement records. 
                Suspend agents when necessary.
              </p>
            </div>

            <div className="border border-green-500/30 bg-green-900/10 rounded-lg p-6 hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <h3 className="text-lg font-bold text-green-400 mb-2 uppercase tracking-wider">⚙️ Administrators</h3>
              <p className="text-gray-400 text-sm">
                Manage the entire platform, approve providers, monitor system health, 
                and maintain audit logs.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black border-t border-green-500/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-green-400 mb-4 uppercase tracking-wider">
            // READY_TO_GET_STARTED?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of users who trust Jan Suraksha for their safety
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-green-600 text-black hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] px-8 py-3 rounded font-bold uppercase tracking-wider transition-all"
            >
              CREATE ACCOUNT
            </Link>
            <Link
              href="/auth/login"
              className="bg-black text-green-400 border-2 border-green-500/50 hover:border-green-500 hover:bg-green-900/20 px-8 py-3 rounded font-bold uppercase tracking-wider transition-all"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-green-500/50 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-green-400 text-lg font-bold mb-4 uppercase tracking-wider">Jan_Suraksha</h3>
              <p className="text-sm">
                National Last-Mile Trust & Verification Platform
              </p>
            </div>
            <div>
              <h4 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/verify" className="hover:text-green-400 transition-colors">Verify Agent</Link></li>
                <li><Link href="/auth/signup" className="hover:text-green-400 transition-colors">Sign Up</Link></li>
                <li><Link href="/auth/login" className="hover:text-green-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-400 font-bold mb-4 uppercase tracking-wider">About</h4>
              <ul className="space-y-2 text-sm">
                <li>Trust Backbone</li>
                <li>AI Risk Intelligence</li>
                <li>AePS Safety</li>
              </ul>
            </div>
            <div>
              <h4 className="text-green-400 font-bold mb-4 uppercase tracking-wider">Contact</h4>
              <p className="text-sm">
                For support and inquiries, please contact your system administrator.
              </p>
            </div>
          </div>
          <div className="border-t border-green-900/30 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Jan Suraksha. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
