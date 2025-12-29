'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState('email_password');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleRequestOTP = async () => {
    try {
      setLoading(true);
      setError('');
      await api.requestOTP(mobile, 'login');
      setOtpSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loginData = {
        login_method: loginMethod,
      };

      if (loginMethod === 'email_password') {
        loginData.email = email;
        loginData.password = password;
      } else if (loginMethod === 'mobile_otp') {
        loginData.mobile = mobile;
        loginData.otp = otp;
      } else if (loginMethod === 'mobile_password') {
        loginData.mobile = mobile;
        loginData.password = password;
      }

      const response = await api.login(loginData);
      
      // Store tokens
      const token = response.access_token || response.token;
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('token', token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      // Redirect based on role
      const userData = response.user || await api.getCurrentUser();
      console.log('Login successful, user:', userData);
      
      // Check if worker needs onboarding
      if (userData.role === 'worker') {
        try {
          const workerData = await api.getMyWorker();
          console.log('Worker data:', workerData);
          
          // If no worker_id, redirect to onboarding
          if (!workerData.worker_id) {
            console.log('Worker not onboarded, redirecting to onboarding');
            router.push('/worker/onboarding');
            return;
          }
        } catch (err) {
          console.log('No worker profile, redirecting to onboarding');
          router.push('/worker/onboarding');
          return;
        }
      }
      
      const roleDashboards = {
        citizen: '/dashboard/citizen',
        worker: '/dashboard/worker',
        delivery_worker: '/dashboard/worker',
        aeps_agent: '/dashboard/worker',
        company: '/dashboard/company',
        provider: '/dashboard/company',
        bank: '/dashboard/bank',
        police: '/dashboard/police',
        admin: '/dashboard/admin',
      };
      
      router.push(roleDashboards[userData.role] || '/dashboard/worker');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={false} />
      
      <div className="flex items-center justify-center px-4 py-12 min-h-[calc(100vh-80px)]">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <div className="mb-6">
          <Link href="/" className="text-green-400 hover:text-green-300 flex items-center gap-2">
            <span>←</span> BACK TO HOME
          </Link>
        </div>

        {/* Login Box */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-wider text-green-400">
              // ACCESS_LOGIN
            </h2>
            <p className="text-gray-400 mt-2">AUTHENTICATE TO ENTER SYSTEM</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded p-4">
                <p className="text-red-400 text-sm">✗ {error}</p>
              </div>
            )}

            {/* Login Method Selection */}
            <div>
              <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                Login Method
              </label>
              <select
                value={loginMethod}
                onChange={(e) => {
                  setLoginMethod(e.target.value);
                  setOtpSent(false);
                  setError('');
                }}
                className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
              >
                <option value="email_password">EMAIL + PASSWORD</option>
                <option value="mobile_password">MOBILE + PASSWORD</option>
                <option value="mobile_otp">MOBILE + OTP</option>
              </select>
            </div>

            {/* Email Field */}
            {loginMethod === 'email_password' && (
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="user@domain.com"
                />
              </div>
            )}

            {/* Mobile Field */}
            {(loginMethod === 'mobile_otp' || loginMethod === 'mobile_password') && (
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="+91XXXXXXXXXX"
                />
                {loginMethod === 'mobile_otp' && !otpSent && (
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={loading || !mobile}
                    className="mt-2 text-sm text-green-400 hover:text-green-300 border border-green-500/30 px-3 py-1 rounded"
                  >
                    → SEND OTP
                  </button>
                )}
              </div>
            )}

            {/* Password Field */}
            {(loginMethod === 'email_password' || loginMethod === 'mobile_password') && (
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="••••••••"
                />
              </div>
            )}

            {/* OTP Field */}
            {loginMethod === 'mobile_otp' && otpSent && (
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  OTP Code
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)] text-center tracking-widest text-2xl"
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded uppercase tracking-widest hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⟳ AUTHENTICATING...' : '→ LOGIN'}
            </button>

            <div className="text-center text-sm border-t border-green-900/30 pt-4">
              <span className="text-gray-400">NEW USER? </span>
              <Link href="/auth/signup" className="text-green-400 hover:text-green-300 font-bold">
                REGISTER →
              </Link>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
