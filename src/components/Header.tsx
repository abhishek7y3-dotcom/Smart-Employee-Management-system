'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ClipboardCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTasks } from '../context/TaskContext';
import { getRecentActivities } from '../utils/dashboardUtils';

const activityMessages: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  status_changed: 'Changed status for',
  deleted: 'Deleted',
};

export const Header: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const currentDate = typeof window === 'undefined'
    ? ''
    : new Date().toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const [isMounted, setIsMounted] = useState(false);
  const { activities } = useTasks();

  const recentActivities = useMemo(() => getRecentActivities(activities, 5), [activities]);

  useEffect(() => {
    setIsMounted(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200 bg-white px-4 shadow-sm transition-colors duration-300 dark:border-zinc-800 dark:bg-zinc-950 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-500/20">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold leading-tight text-zinc-950 dark:text-zinc-50 md:text-lg">Employee Task Manager</h1>
          <p className="hidden text-xs text-zinc-500 dark:text-zinc-400 sm:block">Workspace Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4" ref={containerRef}>
        <div className="hidden text-sm font-medium text-zinc-500 dark:text-zinc-400 lg:block">{isMounted ? currentDate : ''}</div>
        {isMounted && <ThemeToggle />}
        <button
          type="button"
          onClick={() => setIsNotificationsOpen((current) => !current)}
          className="relative rounded-lg p-2 text-zinc-500 transition-colors duration-300 hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {isMounted && recentActivities.length > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950" />
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl shadow-zinc-900/5 ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Recent activity</p>
                <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  {recentActivities.length} new
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Latest task updates from your team.</p>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="p-3 text-sm text-zinc-700 dark:text-zinc-200">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{activity.employeeName}</span>{' '}
                      {activity.details ?? `${activityMessages[activity.action] ?? 'Performed an action on'} ${activity.taskTitle}`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-sm text-zinc-500 dark:text-zinc-400">No recent notifications.</div>
              )}
            </div>
          </div>
        )}

        <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
        <div className="hidden items-center gap-2 sm:flex">
          <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" alt="Diana Prince" className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800" />
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Diana Prince</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Project Manager</p>
          </div>
        </div>
      </div>
    </header>
  );
};
