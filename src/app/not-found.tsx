import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-[#0F2A43] px-4 text-center">
      <h1 className="text-6xl font-extrabold text-[#18A67D] mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-[#64748B] max-w-md mb-6 text-sm">
        The property or page you are looking for might have been moved, removed, or is temporarily unavailable.
      </p>
      <Link
        href="/"
        className="bg-[#0F2A43] hover:bg-[#163b5c] text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors shadow-md"
      >
        Back to Home
      </Link>
    </div>
  );
}
