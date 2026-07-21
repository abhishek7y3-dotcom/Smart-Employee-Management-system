'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutGuardProps {
  children: React.ReactNode;
}

export const LayoutGuard: React.FC<LayoutGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, initializing, loading } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(pathname);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!initializing && !loading && !isAuthenticated && !isAuthPage) {
      router.replace('/login');
    }
  }, [isAuthenticated, initializing, loading, isAuthPage, router]);

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-zinc-950">
        <div className="rounded-xl border border-zinc-200 bg-white px-8 py-6 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-900/50">
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const isChatbotPage = pathname.startsWith('/chatbot');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 transition-colors duration-300 dark:bg-zinc-950">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={`flex-1 transition-colors duration-300 bg-zinc-50 dark:bg-zinc-950 ${isChatbotPage ? 'p-0 overflow-hidden' : 'p-4 md:p-8 overflow-y-auto'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};
