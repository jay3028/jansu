/**
 * AePS Safety Checkpoint Page
 */
'use client';

import { useState } from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/services/api';

export default function AePSPage() {
  const [step, setStep] = useState(1); // 1: Intent, 2: Confirm
  const [intentData, setIntentData] = useState({
    transaction_type: '',
    amount: '',
    agent_id: '',
  });
  const [confirmData, setConfirmData] = useState({
    intent_key: '',
    actual_transaction_type: '',
    actual_amount: '',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleIntentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.verifyAePSIntent(
        intentData.transaction_type,
        parseFloat(intentData.amount),
        intentData.agent_id
      );
      setConfirmData({
        ...confirmData,
        intent_key: response.intent_key,
        actual_transaction_type: intentData.transaction_type,
        actual_amount: intentData.amount,
      });
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to lock transaction intent');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.confirmAePSTransaction(
        confirmData.intent_key,
        confirmData.actual_transaction_type,
        parseFloat(confirmData.actual_amount)
      );
      setResult(response);
    } catch (err) {
      setError(err.message || 'Transaction confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['bank']}>
      <Layout title="AePS Safety Checkpoint">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">AePS Transaction Safety</h2>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleIntentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step 1: Lock Transaction Intent (Before Biometric)
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      Lock the transaction type and amount before the customer provides biometric authentication.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="agent_id" className="block text-sm font-medium text-gray-700">
                      Universal Agent ID *
                    </label>
                    <input
                      type="text"
                      id="agent_id"
                      required
                      value={intentData.agent_id}
                      onChange={(e) => setIntentData({...intentData, agent_id: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="JS-YYYYMMDD-XXXXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700">
                      Transaction Type *
                    </label>
                    <select
                      id="transaction_type"
                      required
                      value={intentData.transaction_type}
                      onChange={(e) => setIntentData({...intentData, transaction_type: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select transaction type</option>
                      <option value="cash_withdrawal">Cash Withdrawal</option>
                      <option value="balance_enquiry">Balance Enquiry</option>
                      <option value="mini_statement">Mini Statement</option>
                      <option value="aadhaar_pay">Aadhaar Pay</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      id="amount"
                      required
                      step="0.01"
                      min="0"
                      value={intentData.amount}
                      onChange={(e) => setIntentData({...intentData, amount: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? 'Locking Intent...' : 'Lock Transaction Intent'}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleConfirmSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Step 2: Confirm Transaction (After Biometric)
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      Verify that the actual transaction matches the locked intent.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-md mb-4">
                    <p className="text-sm font-medium">Locked Intent:</p>
                    <p className="text-sm">Type: {confirmData.actual_transaction_type}</p>
                    <p className="text-sm">Amount: ₹{confirmData.actual_amount}</p>
                  </div>

                  <div>
                    <label htmlFor="actual_transaction_type" className="block text-sm font-medium text-gray-700">
                      Actual Transaction Type *
                    </label>
                    <select
                      id="actual_transaction_type"
                      required
                      value={confirmData.actual_transaction_type}
                      onChange={(e) => setConfirmData({...confirmData, actual_transaction_type: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select transaction type</option>
                      <option value="cash_withdrawal">Cash Withdrawal</option>
                      <option value="balance_enquiry">Balance Enquiry</option>
                      <option value="mini_statement">Mini Statement</option>
                      <option value="aadhaar_pay">Aadhaar Pay</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="actual_amount" className="block text-sm font-medium text-gray-700">
                      Actual Amount (₹) *
                    </label>
                    <input
                      type="number"
                      id="actual_amount"
                      required
                      step="0.01"
                      min="0"
                      value={confirmData.actual_amount}
                      onChange={(e) => setConfirmData({...confirmData, actual_amount: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Confirming...' : 'Confirm Transaction'}
                    </button>
                  </div>
                </form>
              )}

              {result && (
                <div className={`mt-6 p-4 rounded-md border ${
                  result.verified
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h3 className="font-semibold mb-2">
                    {result.verified ? '✓ Transaction Verified' : '✗ Transaction Mismatch Detected'}
                  </h3>
                  {result.mismatch_detected && (
                    <div>
                      <p className="text-sm font-medium text-red-800 mb-2">Mismatch Details:</p>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {result.mismatch_details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="text-sm mt-2">{result.message}</p>
                  <button
                    onClick={() => {
                      setStep(1);
                      setResult(null);
                      setIntentData({ transaction_type: '', amount: '', agent_id: '' });
                      setConfirmData({ intent_key: '', actual_transaction_type: '', actual_amount: '' });
                    }}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    New Transaction
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

