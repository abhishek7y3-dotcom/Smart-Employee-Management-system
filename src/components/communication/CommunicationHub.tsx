'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Inbox, Send, FileEdit, Megaphone, Archive, Radio, BarChart3,
  ArrowLeft, Pin, ArchiveRestore, MoreVertical, SendHorizonal,
  Plus, MessageSquare, Bell, Search,
} from 'lucide-react';
import { useCommunication } from '../../context/CommunicationContext';
import { useAuth } from '../../context/AuthContext';
import { ConversationList } from './ConversationList';
import { ConversationItem } from './ConversationItem';
import { MessageBubble } from './MessageBubble';
import { ComposeModal } from './ComposeModal';
import { AnnouncementCard } from './AnnouncementCard';
import { DraftCard } from './DraftCard';
import { AnalyticsCard } from './AnalyticsCard';
import { NotificationPanel } from './NotificationPanel';
import { EmptyState } from '../ui/EmptyState';
import { formatRelativeTime, getPriorityColor } from '../../utils/communicationUtils';

type TabId = 'inbox' | 'sent' | 'drafts' | 'announcements' | 'archived' | 'broadcast' | 'analytics';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export const CommunicationHub: React.FC = () => {
  const {
    conversations, messages, announcements, drafts, notifications, analytics,
    filters, selectedConversation, isComposeOpen, isMobileListOpen,
    setFilters, resetFilters, selectConversation, openCompose, closeCompose,
    sendMessage, replyToConversation, saveDraft, deleteDraft,
    archiveConversation, unarchiveConversation, pinConversation, unpinConversation,
    createAnnouncement, updateAnnouncement, pinAnnouncement, deleteAnnouncement, sendBroadcast,
    markNotificationRead, markAllNotificationsRead, setMobileListOpen,
    inboxConversations, sentConversations, archivedConversations,
    unreadNotificationCount, unreadMessageCount,
  } = useCommunication();

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'Admin' || user?.role === 'Project Manager';

  const [activeTab, setActiveTab] = useState<TabId>('inbox');
  const [replyText, setReplyText] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasViewedNotifications, setHasViewedNotifications] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '', description: '', priority: 'medium' as const, publishDate: new Date().toISOString().split('T')[0], expiryDate: '',
  });

  const notifRef = useRef<HTMLDivElement>(null);

  // Reset "viewed" state when new unread notifications arrive
  const prevUnreadRef = useRef(unreadNotificationCount);
  useEffect(() => {
    if (unreadNotificationCount > prevUnreadRef.current) {
      setHasViewedNotifications(false);
    }
    prevUnreadRef.current = unreadNotificationCount;
  }, [unreadNotificationCount]);

  const tabs: TabConfig[] = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox className="h-4 w-4" /> },
    { id: 'sent', label: 'Sent', icon: <Send className="h-4 w-4" /> },
    { id: 'drafts', label: 'Drafts', icon: <FileEdit className="h-4 w-4" /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'archived', label: 'Archived', icon: <Archive className="h-4 w-4" /> },
    ...(isAdmin ? [
      { id: 'analytics' as TabId, label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, adminOnly: true },
    ] : []),
  ];

  const currentMessages = selectedConversation ? (messages[selectedConversation.id] || []) : [];

  const handleReply = () => {
    if (!replyText.trim() || !selectedConversation) return;
    replyToConversation(selectedConversation.id, replyText);
    setReplyText('');
  };

  const handleSaveAnnouncement = () => {
    const data = {
      title: announcementForm.title,
      description: announcementForm.description,
      priority: announcementForm.priority,
      publishDate: new Date(announcementForm.publishDate).toISOString(),
      expiryDate: announcementForm.expiryDate ? new Date(announcementForm.expiryDate).toISOString() : undefined,
    };

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, data);
    } else {
      createAnnouncement(data);
    }

    setAnnouncementForm({ title: '', description: '', priority: 'medium', publishDate: new Date().toISOString().split('T')[0], expiryDate: '' });
    setEditingAnnouncement(null);
    setShowAnnouncementForm(false);
  };

  const handleStartEditAnnouncement = (ann: any) => {
    setEditingAnnouncement(ann);
    setAnnouncementForm({
      title: ann.title,
      description: ann.description,
      priority: ann.priority,
      publishDate: ann.publishDate ? new Date(ann.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expiryDate: ann.expiryDate ? new Date(ann.expiryDate).toISOString().split('T')[0] : '',
    });
    setShowAnnouncementForm(true);
  };

  const handleCancelAnnouncementEdit = () => {
    setAnnouncementForm({ title: '', description: '', priority: 'medium', publishDate: new Date().toISOString().split('T')[0], expiryDate: '' });
    setEditingAnnouncement(null);
    setShowAnnouncementForm(false);
  };

  const getConversationsForTab = () => {
    switch (activeTab) {
      case 'inbox': return inboxConversations;
      case 'sent': return sentConversations;
      case 'archived': return archivedConversations;
      default: return inboxConversations;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inbox':
      case 'sent':
      case 'archived':
        return (
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-zinc-200/60 dark:border-zinc-800/60 ${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col`}>
              <ConversationList
                conversations={getConversationsForTab()}
                selectedId={selectedConversation?.id || null}
                onSelect={selectConversation}
                onArchive={activeTab !== 'archived' ? archiveConversation : unarchiveConversation}
                onPin={activeTab !== 'archived' ? ((id: string) => { const c = conversations.find(c => c.id === id); if (c?.isPinned) unpinConversation(id); else pinConversation(id); }) : undefined}
                filters={filters}
                onFilterChange={setFilters}
                onResetFilters={resetFilters}
                title={activeTab === 'inbox' ? 'Inbox' : activeTab === 'sent' ? 'Sent' : 'Archived'}
              />
            </div>

            {/* Message Thread */}
            <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
              {selectedConversation ? (
                <>
                  {/* Thread Header */}
                  <div className="shrink-0 border-b border-zinc-200/60 bg-white/75 backdrop-blur-md px-4 py-3 dark:border-zinc-800/60 dark:bg-zinc-950/75">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => selectConversation(null)}
                        className="md:hidden rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50 truncate">{selectedConversation.subject}</h3>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold ${getPriorityColor(selectedConversation.priority)}`}>
                            {selectedConversation.priority}
                          </span>
                          {selectedConversation.isPinned && <Pin className="h-3 w-3 text-blue-500 shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {selectedConversation.participantNames.join(', ')}
                          </p>
                          {selectedConversation.project && (
                            <span className="text-[9px] font-semibold text-indigo-600 dark:text-indigo-400">· {selectedConversation.project}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => selectedConversation.isPinned ? unpinConversation(selectedConversation.id) : pinConversation(selectedConversation.id)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title={selectedConversation.isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => selectedConversation.isArchived ? unarchiveConversation(selectedConversation.id) : archiveConversation(selectedConversation.id)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title={selectedConversation.isArchived ? 'Unarchive' : 'Archive'}
                        >
                          {selectedConversation.isArchived ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                    {selectedConversation.relatedTaskTitle && (
                      <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-50/50 border border-indigo-200/40 px-2.5 py-1.5 dark:bg-indigo-950/20 dark:border-indigo-900/40">
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">🔗 {selectedConversation.relatedTaskTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {currentMessages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === (user?.id || 'emp-1')}
                      />
                    ))}
                  </div>

                  {/* Reply Input */}
                  <div className="shrink-0 border-t border-zinc-200/60 bg-white/75 backdrop-blur-md px-4 py-3 dark:border-zinc-800/60 dark:bg-zinc-950/75">
                    <div className="flex items-end gap-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply... Use @mention to tag someone."
                        rows={2}
                        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply(); }}
                        className="flex-1 rounded-xl border border-zinc-200/60 bg-zinc-50/50 px-3.5 py-2.5 text-xs text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-800 dark:focus:ring-blue-950/50 resize-none"
                      />
                      <button
                        onClick={handleReply}
                        disabled={!replyText.trim()}
                        className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-2.5 text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <SendHorizonal className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-[9px] text-zinc-400 dark:text-zinc-500">Press Ctrl+Enter to send</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900/60">
                      <MessageSquare className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-zinc-500 dark:text-zinc-400">Select a conversation</h3>
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Choose a conversation from the list to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'drafts':
        return (
          <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Drafts</h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Your saved message drafts</p>
              </div>
              <span className="rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/50 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                {drafts.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {drafts.length > 0 ? (
                drafts.map((draft) => (
                  <DraftCard
                    key={draft.id}
                    draft={draft}
                    onDelete={() => deleteDraft(draft.id)}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState title="No drafts" message="Saved message drafts will appear here." />
                </div>
              )}
            </div>
          </div>
        );

      case 'announcements':
        return (
          <div className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">Announcements</h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">Important updates from your team leads</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({ title: '', description: '', priority: 'medium', publishDate: new Date().toISOString().split('T')[0], expiryDate: '' });
                    setShowAnnouncementForm(!showAnnouncementForm);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Announcement
                </button>
              )}
            </div>

            {/* Announcement Form */}
            {showAnnouncementForm && isAdmin && (
              <div className="rounded-2xl border border-blue-200/60 bg-blue-50/30 p-5 dark:border-blue-900/40 dark:bg-blue-950/10 backdrop-blur-sm space-y-3">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                </h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200/60 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
                />
                <textarea
                  placeholder="Description..."
                  value={announcementForm.description}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200/60 bg-white px-3.5 py-2 text-xs text-zinc-900 placeholder-zinc-400 dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-100 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 resize-none"
                />
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={announcementForm.priority}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, priority: e.target.value as any })}
                    className="rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-xs dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="low">🟢 Low</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="urgent">🔴 Urgent</option>
                  </select>
                  <input
                    type="date"
                    value={announcementForm.publishDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, publishDate: e.target.value })}
                    className="rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-xs dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <input
                    type="date"
                    placeholder="Expiry (optional)"
                    value={announcementForm.expiryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, expiryDate: e.target.value })}
                    className="rounded-xl border border-zinc-200/60 bg-white px-3 py-2 text-xs dark:border-zinc-800/60 dark:bg-zinc-900/30 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button onClick={handleCancelAnnouncementEdit} className="rounded-xl px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">Cancel</button>
                  <button
                    onClick={handleSaveAnnouncement}
                    disabled={!announcementForm.title.trim() || !announcementForm.description.trim()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Megaphone className="h-3.5 w-3.5" />
                    {editingAnnouncement ? 'Save Changes' : 'Publish'}
                  </button>
                </div>
              </div>
            )}

            {/* Announcements List */}
            <div className="space-y-3">
              {announcements.length > 0 ? (
                [...announcements].sort((a, b) => (a.isPinned === b.isPinned) ? 0 : a.isPinned ? -1 : 1).map((ann) => (
                  <AnnouncementCard
                    key={ann.id}
                    announcement={ann}
                    onPin={() => pinAnnouncement(ann.id)}
                    onEdit={() => handleStartEditAnnouncement(ann)}
                    onDelete={() => deleteAnnouncement(ann.id)}
                    isAdmin={isAdmin}
                  />
                ))
              ) : (
                <EmptyState title="No announcements" message="Announcements from your team leads will appear here." />
              )}
            </div>
          </div>
        );

      case 'analytics':
        if (!isAdmin) return null;
        return (
          <div className="p-4 md:p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-950 dark:text-zinc-50 font-outfit">📊 Communication Analytics</h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">Insights into your team's communication patterns</p>
            </div>
            <AnalyticsCard analytics={analytics} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

      {/* Top Bar */}
      <div className="shrink-0 border-b border-zinc-200/60 bg-white/75 backdrop-blur-md px-4 py-2.5 dark:border-zinc-800/60 dark:bg-zinc-950/75 relative z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); selectConversation(null); }}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 shadow-sm'
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900/40 dark:hover:text-zinc-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'inbox' && unreadMessageCount > 0 && (
                  <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                    {unreadMessageCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  const opening = !isNotifOpen;
                  setIsNotifOpen(opening);
                  if (opening && unreadNotificationCount > 0) {
                    markAllNotificationsRead();
                    setHasViewedNotifications(true);
                  }
                }}
                className="relative rounded-xl p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationCount > 0 && !hasViewedNotifications && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white ring-2 ring-white dark:ring-zinc-950 animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>
              <NotificationPanel
                notifications={notifications}
                isOpen={isNotifOpen}
                onClose={() => { setIsNotifOpen(false); setHasViewedNotifications(true); }}
                onMarkRead={markNotificationRead}
                onMarkAllRead={markAllNotificationsRead}
                unreadCount={unreadNotificationCount}
                anchorRef={notifRef}
              />
            </div>

            {/* Compose Button */}
            <button
              onClick={() => openCompose()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-[11px] font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compose</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative z-10">
        {renderTabContent()}
      </div>

      {/* Compose Modal */}
      <ComposeModal
        isOpen={isComposeOpen}
        onClose={closeCompose}
        onSend={sendMessage}
        onSaveDraft={saveDraft}
      />

      {/* Floating Compose Button (mobile) */}
      <button
        onClick={() => openCompose()}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:scale-105 md:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
};