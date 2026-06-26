'use client';

import { useEffect, useState } from 'react';

export default function MockAuthBanner() {
  const [mockEnabled, setMockEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setMockEnabled(window.localStorage.getItem('use_mock_auth') === 'true');
  }, []);

  const toggleMockAuth = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const nextValue = !mockEnabled;
    window.localStorage.setItem('use_mock_auth', nextValue ? 'true' : 'false');
    setMockEnabled(nextValue);
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-3xl border border-zinc-200 bg-white px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500">
          Auth stub
        </span>
        <button
          type="button"
          onClick={toggleMockAuth}
          className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          {mockEnabled ? 'Disable' : 'Enable'}
        </button>
      </div>
      <p className="mt-2 max-w-xs text-[11px] text-zinc-600">
        {mockEnabled
          ? 'Mock authentication is enabled for local testing.'
          : 'Enable mock auth to use local registration/login without a backend.'}
      </p>
    </div>
  );
}
