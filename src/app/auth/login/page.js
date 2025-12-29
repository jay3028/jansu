/**
 * Login page - supports email/password and mobile/OTP
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState('email_password'); // email_password, mobile_otp, mobile_password
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
      
      // Store tokens (support both access_token and token for backward compatibility)
      const token = response.access_token || response.token;
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('token', token); // Backward compatibility
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      // Redirect based on role
      const userData = response.user || await api.getCurrentUser();
      const roleDashboards = {
        citizen: '/dashboard/citizen',
        worker: '/dashboard/worker',
        provider: '/dashboard/provider',
        bank: '/dashboard/bank',
        police: '/dashboard/police',
        admin: '/dashboard/admin',
      };
      
      router.push(roleDashboards[userData.role] || '/dashboard/citizen');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Jan Suraksha
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Login Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Method
              </label>
              <select
                value={loginMethod}
                onChange={(e) => {
                  setLoginMethod(e.target.value);
                  setOtpSent(false);
                  setError('');
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="email_password">Email + Password</option>
                <option value="mobile_password">Mobile + Password</option>
                <option value="mobile_otp">Mobile + OTP</option>
              </select>
            </div>

            {/* Email Field */}
            {loginMethod === 'email_password' && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            {/* Mobile Field */}
            {(loginMethod === 'mobile_otp' || loginMethod === 'mobile_password') && (
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="+91XXXXXXXXXX"
                />
                {loginMethod === 'mobile_otp' && !otpSent && (
                  <button
                    type="button"
                    onClick={handleRequestOTP}
                    disabled={loading || !mobile}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                  >
                    Send OTP
                  </button>
                )}
              </div>
            )}

            {/* Password Field */}
            {(loginMethod === 'email_password' || loginMethod === 'mobile_password') && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            {/* OTP Field */}
            {loginMethod === 'mobile_otp' && otpSent && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                  OTP
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Don't have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

