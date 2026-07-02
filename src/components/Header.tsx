'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ClipboardCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
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
  const { user, logout } = useAuth();

  const recentActivities = useMemo(() => getRecentActivities(activities, 5), [activities]);

  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setLastSeenId(window.localStorage.getItem('last_seen_activity_id'));
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasNewActivity = useMemo(() => {
    if (recentActivities.length === 0) return false;
    return lastSeenId !== recentActivities[0].id;
  }, [recentActivities, lastSeenId]);

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((current) => {
      const nextVal = !current;
      if (nextVal && recentActivities.length > 0) {
        window.localStorage.setItem('last_seen_activity_id', recentActivities[0].id);
        setLastSeenId(recentActivities[0].id);
      }
      return nextVal;
    });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200/80 bg-white px-4 shadow-sm transition-colors duration-300 dark:border-zinc-800/80 dark:bg-zinc-950 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 hover:scale-105 transition-all duration-300">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold leading-tight text-zinc-950 dark:text-zinc-50 md:text-lg">Employee Task Manager</h1>
          <p className="hidden text-xs text-zinc-400 dark:text-zinc-500 sm:block">Workspace Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4" ref={containerRef}>
        <div className="hidden text-sm font-semibold text-zinc-500 dark:text-zinc-400 lg:block">{isMounted ? currentDate : ''}</div>
        {isMounted && <ThemeToggle />}
        <button
          type="button"
          onClick={handleToggleNotifications}
          className="relative rounded-xl border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm transition-colors duration-300 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-blue-400 cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {isMounted && hasNewActivity && (
            <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
          )}
        </button>

        {isNotificationsOpen && (
          <div className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 dark:border-zinc-800/80 dark:bg-zinc-950">
            <div className="border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 font-outfit">Recent activity</p>
                <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {recentActivities.length} logs
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Latest task updates from your team.</p>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-zinc-200/80 dark:divide-zinc-800/60">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="p-3.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{activity.employeeName}</span>{' '}
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {activity.details ?? `${activityMessages[activity.action] ?? 'Performed an action on'} ${activity.taskTitle}`}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-zinc-500 dark:text-zinc-400 text-center">No recent notifications.</div>
              )}
            </div>
          </div>
        )}

        <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
        <div className="hidden items-center gap-2 sm:flex">
          <img
            src={user?.profilePicture || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
            alt={user?.name || 'Diana Prince'}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-200/50 dark:ring-zinc-800"
          />
          <div className="hidden text-left md:block">
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{user?.name || 'Diana Prince'}</p>
            <button
              onClick={logout}
              className="block text-[10px] font-bold text-red-500 hover:text-red-650 transition-colors duration-300 bg-transparent border-none p-0 text-left outline-none cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
