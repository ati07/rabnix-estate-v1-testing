'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error if needed
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-[#0F2A43] px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Something went wrong</h1>
      <p className="text-[#64748B] max-w-md mb-6 text-sm">
        {error.message || 'An unexpected error occurred while loading this page. Please try again.'}
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="bg-[#18A67D] hover:bg-[#0E7C5D] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="bg-[#0F2A43] hover:bg-[#163b5c] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
