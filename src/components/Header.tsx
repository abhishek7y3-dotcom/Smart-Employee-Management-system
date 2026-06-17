import React from 'react';

export const Header: React.FC = () => {
  const currentDate = new Date().toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        {/* Logo Icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">Employee Task Manager</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Workspace Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden text-sm font-medium text-zinc-500 md:block dark:text-zinc-400">
          {currentDate}
        </div>

        {/* Notifications */}
        <button className="relative rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950"></span>
        </button>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

        {/* User Info */}
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
            alt="Diana Prince"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
          />
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Diana Prince</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-450">Project Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
