'use client';

// AePS Agents Page - Redirect to main bank dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AePSAgentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/bank');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
      <div className="text-green-400 text-xl">⟳ REDIRECTING...</div>
    </div>
  );
}
