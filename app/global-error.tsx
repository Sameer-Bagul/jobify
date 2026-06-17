"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center card p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-dark-walnut mb-4">A critical error occurred</h2>
            <p className="text-gray-600 mb-6 font-mono text-sm break-words">{error.message || "Unknown error"}</p>
            <button
              onClick={() => reset()}
              className="btn-primary w-full"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
