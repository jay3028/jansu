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
      <div className="bg-black border-t border-green-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-green-400 mb-12 tracking-wider uppercase">
            // PLATFORM_FEATURES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-green-900/10 border border-green-500/30 rounded-lg hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">Real-Time Verification</h3>
              <p className="text-gray-400 text-sm">
                Instantly verify delivery agents and AePS operators using QR codes, 
                phone numbers, or Universal Agent IDs.
              </p>
            </div>

            <div className="p-6 bg-green-900/10 border border-green-500/30 rounded-lg hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">Trust Backbone</h3>
              <p className="text-gray-400 text-sm">
                Central verification database with comprehensive agent profiles, 
                police verification status, and risk assessments.
              </p>
            </div>

            <div className="p-6 bg-green-900/10 border border-green-500/30 rounded-lg hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">AI Risk Intelligence</h3>
              <p className="text-gray-400 text-sm">
                AI-based risk monitoring system ready for federated learning, 
                providing real-time risk scores and fraud detection.
              </p>
            </div>

            <div className="p-6 bg-green-900/10 border border-green-500/30 rounded-lg hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">AePS Safety</h3>
              <p className="text-gray-400 text-sm">
                Customer intent verification before biometric authentication, 
                transaction mismatch detection, and fraud prevention.
              </p>
            </div>

            <div className="p-6 bg-green-900/10 border border-green-500/30 rounded-lg hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">Police Integration</h3>
              <p className="text-gray-400 text-sm">
                Complete police verification workflow, agent search, 
                incident logging, and enforcement capabilities.
              </p>
            </div>

            <div className="p-6 bg-green-900/10 border border-green-500/30 rounded-lg hover:border-green-500/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(34,197,94,0.5)]">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2 uppercase tracking-wider">Admin Dashboard</h3>
              <p className="text-gray-400 text-sm">
                Comprehensive system administration, user management, 
                audit logs, and system monitoring.
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
