'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutGuardProps {
  children: React.ReactNode;
}

export const LayoutGuard: React.FC<LayoutGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, initializing, loading } = useAuth();

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (initializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <div className="rounded-xl border border-zinc-200 bg-white px-8 py-6 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 transition-colors duration-300 dark:bg-zinc-950">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 transition-colors duration-300 dark:bg-zinc-950 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
