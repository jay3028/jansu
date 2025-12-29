/**
 * Signup page - supports email/password and mobile/OTP
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';

export default function SignupPage() {
  const [signupMethod, setSignupMethod] = useState('email'); // email, mobile
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('worker');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  
  const { signup } = useAuth();
  const router = useRouter();

  const handleRequestOTP = async () => {
    try {
      setLoading(true);
      setError('');
      const purpose = signupMethod === 'email' ? 'email_verification' : 'signup';
      const identifier = signupMethod === 'email' ? email : mobile;
      await api.requestOTP(identifier, purpose);
      setOtpSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const response = await api.verifyOTP(registeredEmail, null, otp, 'email_verification');
      
      // Store tokens and user data
      const token = response.access_token || response.token;
      const user = response.user;
      
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('token', token); // Backward compatibility
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Redirect based on role
        const roleDashboards = {
          worker: '/dashboard/worker',
          provider: '/dashboard/provider',
          bank: '/dashboard/bank',
          police: '/dashboard/police',
          admin: '/dashboard/admin',
        };
        
        router.push(roleDashboards[user.role] || '/dashboard/worker');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    try {
      await api.resendOTP(registeredEmail);
      setOtp('');
      setError('');
      // Show success message
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const signupData = {
        full_name: fullName,
        role: role,
      };

      if (signupMethod === 'email') {
        signupData.email = email;
        signupData.password = password;
      } else {
        signupData.mobile = mobile;
        signupData.otp = otp;
        if (!otpSent || !otp) {
          throw new Error('Please request and enter OTP');
        }
      }

      const response = await api.signup(signupData);
      
      // Check if email verification is required
      if (response.requires_verification) {
        setRegisteredEmail(email);
        setShowOtpVerification(true);
        setError('');
        // Don't redirect yet, show OTP verification
        return;
      }
      
      // If tokens are returned (mobile signup), store them and redirect
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('token', response.access_token); // Backward compatibility
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        // Redirect based on role
        const userData = response.user || await api.getCurrentUser();
        const roleDashboards = {
          worker: '/dashboard/worker',
          provider: '/dashboard/provider',
          bank: '/dashboard/bank',
          police: '/dashboard/police',
          admin: '/dashboard/admin',
        };
        
        router.push(roleDashboards[userData.role] || '/dashboard/worker');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Jan Suraksha platform
          </p>
        </div>

        {showOtpVerification ? (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-gray-600">
                We've sent a 6-digit OTP code to <strong>{registeredEmail}</strong>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Please check your inbox and enter the code below
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-900 mb-2">
                Enter OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white text-center text-2xl tracking-widest font-mono"
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading || otp.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {otpLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={otpLoading}
                className="text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                Didn't receive the code? Resend OTP
              </button>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpVerification(false);
                    setOtp('');
                    setRegisteredEmail('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  ← Back to registration
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-4">
            {/* Signup Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Signup Method
              </label>
                <select
                  value={signupMethod}
                  onChange={(e) => {
                    setSignupMethod(e.target.value);
                    setOtpSent(false);
                    setError('');
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                >
                <option value="email">Email + Password</option>
                <option value="mobile">Mobile + OTP</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-900">
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                />
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-900">
                I am a
              </label>
              <select
                id="role"
                name="role"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
              >
                <option value="worker">Worker / Agent</option>
                <option value="provider">Service Provider</option>
                <option value="bank">Bank / AePS Operator</option>
                <option value="police">Police / Law Enforcement</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            {/* Email Field */}
            {signupMethod === 'email' && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    After registration, you'll receive an OTP to verify your email
                  </p>
                </div>
              </>
            )}

            {/* Mobile Field */}
            {signupMethod === 'mobile' && (
              <>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-900">
                    Mobile Number
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                    placeholder="+91XXXXXXXXXX"
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={loading || !mobile}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-500 disabled:opacity-50"
                    >
                      Send OTP
                    </button>
                  )}
                </div>
                {otpSent && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-900">
                      OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                )}
              </>
            )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </button>
            </div>

            <div className="text-center text-sm">
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

