'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, loading, initializing } = useAuth();

  useEffect(() => {
    if (!initializing && !loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, initializing, loading, router]);

  if (initializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="rounded-xl bg-white px-8 py-6 shadow ring-1 ring-black/5">
          <p className="text-sm font-medium text-zinc-700">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
