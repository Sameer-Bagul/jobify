"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl md:text-8xl font-bold text-tangerine-dream mb-4 font-outfit">404</h1>
      <h2 className="text-2xl font-semibold text-dark-walnut mb-6">Page Not Found</h2>
      <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Link href="/" className="btn-primary">
        Return Home
      </Link>
    </div>
  );
}
