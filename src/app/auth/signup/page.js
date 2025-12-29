'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function SignupPage() {
  const [signupMethod, setSignupMethod] = useState('email');
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
      
      const token = response.access_token || response.token;
      const user = response.user;
      
      if (token) {
        localStorage.setItem('access_token', token);
        localStorage.setItem('token', token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        const roleDashboards = {
          worker: '/worker/onboarding',
          delivery_worker: '/worker/onboarding',
          aeps_agent: '/worker/onboarding',
          company: '/dashboard/company',
          provider: '/dashboard/company',
          bank: '/dashboard/bank',
          police: '/dashboard/police',
          admin: '/dashboard/admin',
        };
        
        router.push(roleDashboards[user.role] || '/worker/onboarding');
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
      
      if (response.requires_verification) {
        setRegisteredEmail(email);
        setShowOtpVerification(true);
        setError('');
        return;
      }
      
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('token', response.access_token);
        if (response.refresh_token) {
          localStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        
        const userData = response.user || await api.getCurrentUser();
        const roleDashboards = {
          worker: '/worker/onboarding',
          delivery_worker: '/worker/onboarding',
          aeps_agent: '/worker/onboarding',
          company: '/dashboard/company',
          provider: '/dashboard/company',
          bank: '/dashboard/bank',
          police: '/dashboard/police',
          admin: '/dashboard/admin',
        };
        
        router.push(roleDashboards[userData.role] || '/worker/onboarding');
      }
    } catch (err) {
      setError(err.message || 'Signup failed');
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

        {/* Signup Box */}
        <div className="bg-black border-2 border-green-500/50 rounded-lg p-8 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-wider text-green-400">
              // NEW_USER_REGISTRATION
            </h2>
            <p className="text-gray-400 mt-2">CREATE SECURE ACCESS CREDENTIALS</p>
          </div>

          {showOtpVerification ? (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-900/20 border-2 border-green-500/50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-2">VERIFY EMAIL</h3>
                <p className="text-gray-400 text-sm">
                  OTP SENT TO: <span className="text-green-400">{registeredEmail}</span>
                </p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded p-4">
                  <p className="text-red-400 text-sm">✗ {error}</p>
                </div>
              )}

              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded uppercase tracking-widest hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50"
              >
                {otpLoading ? '⟳ VERIFYING...' : '→ VERIFY EMAIL'}
              </button>

              <div className="text-center space-y-2 border-t border-green-900/30 pt-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpLoading}
                  className="text-sm text-green-400 hover:text-green-300"
                >
                  ↻ RESEND OTP
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOtpVerification(false);
                      setOtp('');
                      setRegisteredEmail('');
                    }}
                    className="text-sm text-gray-400 hover:text-gray-300"
                  >
                    ← BACK TO REGISTRATION
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleSignup}>
              {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded p-4">
                  <p className="text-red-400 text-sm">✗ {error}</p>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  placeholder="JOHN DOE"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  User Role
                </label>
                <select
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                >
                  <option value="worker">WORKER / AGENT</option>
                  <option value="company">SERVICE PROVIDER</option>
                  <option value="bank">BANK / AePS OPERATOR</option>
                  <option value="police">POLICE / LAW ENFORCEMENT</option>
                  <option value="admin">SYSTEM ADMIN</option>
                </select>
              </div>

              {/* Signup Method */}
              <div>
                <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                  Signup Method
                </label>
                <select
                  value={signupMethod}
                  onChange={(e) => {
                    setSignupMethod(e.target.value);
                    setOtpSent(false);
                    setError('');
                  }}
                  className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                >
                  <option value="email">EMAIL + PASSWORD</option>
                  <option value="mobile">MOBILE + OTP</option>
                </select>
              </div>

              {/* Email + Password */}
              {signupMethod === 'email' && (
                <>
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
                      minLength={8}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      → EMAIL VERIFICATION REQUIRED AFTER REGISTRATION
                    </p>
                  </div>
                </>
              )}

              {/* Mobile + OTP */}
              {signupMethod === 'mobile' && (
                <>
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
                    {!otpSent && (
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
                  {otpSent && (
                    <div>
                      <label className="block text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-black border-2 border-green-500/50 text-green-300 px-4 py-3 rounded text-center text-2xl tracking-widest focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-black font-bold py-3 px-4 rounded uppercase tracking-widest hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50"
              >
                {loading ? '⟳ REGISTERING...' : '→ SIGN UP'}
              </button>

              <div className="text-center text-sm border-t border-green-900/30 pt-4">
                <span className="text-gray-400">ALREADY REGISTERED? </span>
                <Link href="/auth/login" className="text-green-400 hover:text-green-300 font-bold">
                  LOGIN →
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
