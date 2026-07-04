'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [isMock, setIsMock] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMock(window.localStorage.getItem('use_mock_auth') === 'true');
    }
  }, []);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: 'Task List',
      href: '/tasks',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      name: 'Team Members',
      href: '/employees',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      name: 'Communication',
      href: '/communication',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.04 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 border-r border-zinc-200/60 bg-white/60 px-4 py-6 dark:border-zinc-800/60 dark:bg-zinc-950/60 flex flex-col justify-between backdrop-blur-md">
      <div className="space-y-6">
        <div className="px-3.5 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Workspace Navigation
        </div>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3.5 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 border-l-2 ${
                  isActive
                    ? 'bg-zinc-100/80 text-zinc-950 border-blue-600 dark:bg-zinc-900/60 dark:text-zinc-50 dark:border-blue-500 font-bold shadow-sm'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950 border-transparent dark:text-zinc-400 dark:hover:bg-zinc-900/30 dark:hover:text-zinc-100'
                }`}
              >
                <span className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-zinc-200/60 pt-4 dark:border-zinc-800/65">
        <div className="rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-4 text-[11px] text-zinc-500 dark:border-zinc-800/40 dark:bg-zinc-900/20 dark:text-zinc-400">
          <p className="font-bold text-zinc-800 dark:text-zinc-300">
            Mode: <span className="text-blue-600 dark:text-blue-400">{isMock ? 'Local Mock' : 'Server API'}</span>
          </p>
          <p className="mt-1 leading-relaxed">
            {isMock
              ? 'Changes are saved to browser local storage.'
              : 'Connected to MongoDB backend database.'}
          </p>
        </div>
      </div>
    </aside>
  );
};

