/**
 * Citizen Dashboard
 */
'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function CitizenDashboard() {
  return (
    <ProtectedRoute allowedRoles={['citizen']}>
      <Layout title="Citizen Dashboard">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/verify"
              className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verify Agent
              </h3>
              <p className="text-sm text-gray-600">
                Scan QR code or search by phone number to verify an agent's identity and trust status
              </p>
            </Link>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recent Verifications
              </h3>
              <p className="text-sm text-gray-600">
                View your recent agent verification history
              </p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Safety Tips
              </h3>
              <p className="text-sm text-gray-600">
                Learn how to stay safe when dealing with delivery agents and AePS operators
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

