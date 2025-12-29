'use client';

// Citizen Dashboard - Redirect to public verify page
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CitizenDashboard() {
  const router = useRouter();

  useEffect(() => {
    router.push('/verify');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
      <div className="text-green-400 text-xl">⟳ REDIRECTING TO VERIFICATION...</div>
    </div>
  );
}
