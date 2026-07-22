'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ClipboardCheck, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { AccessibilityToggle } from './AccessibilityToggle';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ProfileModal } from './profile/ProfileModal';
import { useRouter } from 'next/navigation';



interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
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
  const { user, logout, updateUser } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setIsUploading(true);
      try {
        await updateUser({ profilePicture: base64String });
      } catch (error) {
        console.error('Failed to update profile picture', error);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((current) => !current);
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsNotificationsOpen(false);

    // Navigate based on type
    if (notification.type === 'message' || notification.type === 'announcement') {
      router.push('/communication');
    } else if (notification.type === 'task') {
      router.push('/tasks');
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-zinc-200/40 bg-white/60 px-4 backdrop-blur-xl shadow-sm transition-colors duration-300 dark:border-zinc-800/50 dark:bg-zinc-900/60 md:px-6">
      <div
        className="flex min-w-0 items-center gap-3 cursor-pointer select-none"
        onClick={onMenuClick}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm hover:scale-105 transition-all duration-300">
          <ClipboardCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold leading-tight text-zinc-950 dark:text-zinc-50 md:text-lg hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Employee Task Manager</h1>
          <p className="hidden text-xs text-zinc-400 dark:text-zinc-500 sm:block">Workspace Dashboard</p>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4" ref={containerRef}>
        <div className="hidden text-sm font-semibold text-zinc-500 dark:text-zinc-400 lg:block">{isMounted ? currentDate : ''}</div>
        {isMounted && <AccessibilityToggle />}
        {isMounted && <ThemeToggle />}
        <div className="relative">
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="relative rounded-xl border border-zinc-200 bg-white p-2 text-zinc-700 shadow-sm transition-colors duration-300 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-blue-400 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {isMounted && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 mt-1 z-50 w-80 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 dark:border-zinc-800/80 dark:bg-zinc-950">
              <div className="border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 font-outfit">Notifications</p>
                  <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {unreadCount} unread
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Your recent alerts and messages.</p>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-zinc-200/80 dark:divide-zinc-800/60">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer flex gap-3 ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                    >
                      {notification.senderAvatar ? (
                        <img src={notification.senderAvatar} alt={notification.senderName} className="h-8 w-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="h-2 w-2 rounded-full bg-blue-600 self-center shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-xs text-zinc-500 dark:text-zinc-400 text-center">No recent notifications.</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 sm:block" />
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-left outline-none"
          >
            <img
              src={user?.profilePicture || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
              alt={user?.name || 'Diana Prince'}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-zinc-200/50 dark:ring-zinc-800 shadow-sm"
            />
            <div className="hidden text-left md:block">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{user?.name || 'Diana Prince'}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">{user?.designation || (user?.role === 'admin' ? 'CEO' : 'Employee')}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 hidden md:block" />
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 top-12 mt-1.5 z-50 w-48 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-2 dark:border-zinc-800/80 dark:bg-zinc-950">
              <div className="p-1.5 space-y-0.5">
                <div className="flex flex-col items-center justify-center p-4 border-b border-zinc-100 dark:border-zinc-900 mb-1">
                  <div
                    className="relative cursor-pointer group rounded-full overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <img
                      src={user?.profilePicture || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'}
                      alt={user?.name || 'User Profile'}
                      className={`h-16 w-16 object-cover transition-opacity ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`}
                    />
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-4 w-4 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin dark:border-white dark:border-t-transparent" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                  >
                    {isUploading ? 'Uploading...' : 'Change profile picture'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleProfilePicChange}
                  />
                </div>
                <button
                  onClick={() => {
                    setIsProfileModalOpen(true);
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors cursor-pointer text-left outline-none"
                >
                  <UserIcon className="h-4 w-4 text-zinc-400" />
                  View Profile
                </button>
                <div className="h-px bg-zinc-100 dark:bg-zinc-900 mx-1.5" />
                <button
                  onClick={() => {
                    logout();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left outline-none"
                >
                  <LogOut className="h-4 w-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
