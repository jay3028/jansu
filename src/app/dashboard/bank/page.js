/**
 * Bank / AePS Operator Dashboard
 */
'use client';

import Link from 'next/link';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function BankDashboard() {
  return (
    <ProtectedRoute allowedRoles={['bank']}>
      <Layout title="Bank / AePS Operator Dashboard">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/bank/aeps"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AePS Safety Checkpoint
              </h3>
              <p className="text-sm text-gray-600">
                Lock transaction intent before biometric and verify transaction matches
              </p>
            </Link>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Transaction History
              </h3>
              <p className="text-sm text-gray-600">
                View all AePS transactions and safety verifications
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Agent Verification
              </h3>
              <p className="text-sm text-gray-600">
                Verify agent status before processing transactions
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

