'use client';

export default function Offline() {
  return (
    <main className="min-h-screen bg-background text-white flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mb-6">
          <svg
            className="w-24 h-24 mx-auto text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-white">
          You're Offline
        </h1>
        <p className="text-gray-400 mb-6">
          AI features are unavailable without an internet connection. You can still view your logged data and make manual entries.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
