'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import Navbar from '@/components/Navbar';

export default function VerifyWorkerPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (params.id && user?.role === 'police') {
      fetchWorkerDetails();
    } else if (user && user.role !== 'police') {
      router.push('/');
    }
  }, [params.id, user]);

  const fetchWorkerDetails = async () => {
    try {
      setError('');
      const response = await api.get(`/police/workers/by-id/${params.id}`);
      setWorker(response);
      console.log('[WORKER DETAILS]', response);
    } catch (err) {
      console.error('Error fetching worker:', err);
      setError(err.message || 'Failed to load worker details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to VERIFY this worker? This will generate their official Worker ID and QR code.')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post('/police/verify', {
        worker_id: worker.id,
        status: 'verified',
        remarks: 'Approved after verification'
      });
      alert(`✅ Worker Verified Successfully!\n\nWorker ID: ${response.worker_id}\nQR Code Generated: Yes`);
      router.push('/dashboard/police');
    } catch (err) {
      alert(`❌ Verification Failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setProcessing(true);
    try {
      await api.post('/police/verify', {
        worker_id: worker.id,
        status: 'rejected',
        remarks: reason
      });
      alert('✅ Worker Rejected');
      router.push('/dashboard/police');
    } catch (err) {
      alert(`❌ Rejection Failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-green-400 text-xl">⟳ LOADING WORKER DATA...</div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <Navbar showAuth={true} user={user} onLogout={handleLogout} />
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">✗ {error || 'Worker not found'}</p>
          <Link
            href="/dashboard/police"
            className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all"
          >
            ← BACK TO DASHBOARD
          </Link>
        </div>
      </div>
    );
  }

  const isPending = worker.verification_status === 'pending';

  return (
    <div className="min-h-screen bg-black text-white font-mono relative overflow-hidden">
      <Navbar showAuth={true} user={user} onLogout={handleLogout} />
      
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_90%)]"></div>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='30' font-family='monospace' font-size='14' fill='rgba(0, 255, 65, 0.15)'%3E0x4F AB 1C 9D%3C/text%3E%3C/svg%3E")`,
        animation: 'digital-rain 20s linear infinite'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/police"
            className="text-green-400 hover:text-green-300 mb-4 inline-block"
          >
            ← BACK TO DASHBOARD
          </Link>
          <h1 className="text-3xl font-bold text-green-400">// WORKER_VERIFICATION</h1>
          <p className="text-gray-400 text-sm mt-1">DETAILED VERIFICATION SYSTEM</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Worker Photo */}
          <div className="lg:col-span-1">
            <div className="bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <h2 className="text-xl font-bold text-green-400 mb-4">WORKER PHOTO</h2>
              
              {worker.selfie_url ? (
                <div className="relative">
                  <img 
                    src={`http://localhost:8000/${worker.selfie_url}`}
                    alt="Worker Selfie"
                    className="w-full h-auto rounded border-2 border-green-500/50"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="%23111"/><text x="50%" y="50%" text-anchor="middle" fill="%2322c55e" font-family="monospace" font-size="20">IMAGE NOT AVAILABLE</text></svg>';
                    }}
                  />
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <p className="text-xs text-gray-400">Face verification required for approval</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900/50 border border-gray-700 rounded p-8 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-gray-500 text-sm">NO PHOTO</p>
                </div>
              )}

              {/* Status Badge */}
              <div className="mt-4">
                <div className={`text-center py-2 px-4 rounded font-bold ${
                  worker.verification_status === 'verified' 
                    ? 'bg-green-900/20 border border-green-500/50 text-green-400'
                    : worker.verification_status === 'rejected'
                    ? 'bg-red-900/20 border border-red-500/50 text-red-400'
                    : 'bg-yellow-900/20 border border-yellow-500/50 text-yellow-400'
                }`}>
                  {worker.verification_status?.toUpperCase() || 'PENDING'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Worker Details */}
          <div className="lg:col-span-2">
            <div className="bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <h2 className="text-xl font-bold text-green-400 mb-6">WORKER INFORMATION</h2>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-green-900/30">PERSONAL DETAILS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Full Name" value={worker.user?.full_name || 'N/A'} />
                    <InfoField label="Mobile" value={worker.user?.mobile || 'N/A'} />
                    <InfoField label="Email" value={worker.user?.email || 'N/A'} />
                    <InfoField label="Worker ID" value={worker.worker_id || 'Not Assigned'} mono />
                  </div>
                </div>

                {/* Category & Location */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-green-900/30">WORK DETAILS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Category" value={worker.category?.toUpperCase() || 'N/A'} />
                    <InfoField label="Address" value={worker.address || 'N/A'} />
                    <InfoField label="City" value={worker.city || 'N/A'} />
                    <InfoField label="State" value={worker.state || 'N/A'} />
                    <InfoField label="Pincode" value={worker.pincode || 'N/A'} />
                  </div>
                </div>

                {/* AePS Information (if applicable) */}
                {worker.bank_affiliation && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-green-900/30">AePS DETAILS</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InfoField label="Bank Affiliation" value={worker.bank_affiliation || 'N/A'} />
                      <InfoField label="BC Affiliation" value={worker.bc_affiliation || 'N/A'} />
                      <InfoField label="Operator ID" value={worker.aeps_operator_id || 'N/A'} />
                      <InfoField label="Service Region" value={worker.service_region || 'N/A'} />
                    </div>
                  </div>
                )}

                {/* Verification Details */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 pb-2 border-b border-green-900/30">VERIFICATION INFO</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoField label="Aadhaar Reference" value={worker.aadhaar_reference || 'Not Provided'} mono />
                    <InfoField label="Onboarding Step" value={`${worker.onboarding_step || 0}/6`} />
                    <InfoField label="Risk Score" value={worker.risk_score || '0'} />
                    <InfoField label="Complaints" value={worker.complaint_count || '0'} />
                    <InfoField label="Submitted At" value={new Date(worker.submitted_at).toLocaleString()} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Section - Show for Verified Workers */}
        {worker.verification_status === 'verified' && worker.worker_id && worker.worker_id !== 'Pending Verification' && (
          <div className="mt-6 bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <h3 className="text-lg font-bold text-green-400 mb-4">✓ WORKER QR CODE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-4">
                  This QR code can be used for instant verification by citizens and companies.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-400">Worker ID: <span className="text-white font-mono">{worker.worker_id}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-400">Status: <span className="text-green-400">VERIFIED</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-gray-400">QR Code Generated: <span className="text-green-400">YES</span></span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center items-center">
                {worker.qr_code_url ? (
                  <div className="inline-block p-4 bg-white rounded-lg">
                    <img 
                      src={`http://localhost:8000/${worker.qr_code_url}`} 
                      alt="Worker QR Code" 
                      className="w-48 h-48"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-48 h-48 flex items-center justify-center bg-gray-900 text-gray-500 text-xs">QR Code Error</div>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-gray-900/50 border border-gray-700 rounded p-8 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-gray-500 text-sm mb-3">QR Code Not Generated</p>
                    <button
                      onClick={async () => {
                        if (confirm('Generate QR code for this worker?')) {
                          try {
                            await api.post(`/police/regenerate-qr/${worker.id}`);
                            alert('✅ QR Code generated successfully! Refreshing...');
                            fetchWorkerDetails();
                          } catch (err) {
                            alert(`❌ Failed to generate QR code: ${err.message}`);
                          }
                        }
                      }}
                      className="bg-green-600 text-black font-bold py-2 px-4 rounded hover:bg-green-500 transition-all text-sm"
                    >
                      GENERATE QR CODE NOW
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isPending && (
          <div className="mt-6 bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <h3 className="text-lg font-bold text-white mb-4">VERIFICATION ACTIONS</h3>
            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 bg-green-600 text-black font-bold py-3 px-6 rounded hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? '⟳ PROCESSING...' : '✓ APPROVE & GENERATE ID'}
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 bg-red-600 text-white font-bold py-3 px-6 rounded hover:bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.8)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? '⟳ PROCESSING...' : '✗ REJECT APPLICATION'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              * Approval will generate official Worker ID and QR Code
            </p>
          </div>
        )}

        {/* Verification History */}
        {worker.verifications && worker.verifications.length > 0 && (
          <div className="mt-6 bg-black border-2 border-green-500/50 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
            <h3 className="text-lg font-bold text-green-400 mb-4">VERIFICATION HISTORY</h3>
            <div className="space-y-2">
              {worker.verifications.map((v, idx) => (
                <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded p-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold">{v.status?.toUpperCase()}</span>
                    <span className="text-gray-400">{new Date(v.verification_date).toLocaleString()}</span>
                  </div>
                  {v.remarks && <p className="text-gray-400 mt-1">{v.remarks}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Info Field Component
function InfoField({ label, value, mono = false }) {
  return (
    <div className="bg-gray-900/30 border border-gray-700/50 rounded p-3">
      <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">{label}</p>
      <p className={`text-white ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
  );
}

