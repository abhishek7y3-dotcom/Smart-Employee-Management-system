'use client';

import React from 'react';
import { Archive, ArrowUp, Bell, Check, Paperclip, Pin, Star } from 'lucide-react';
import { Conversation } from '../../types/communication';
import { formatRelativeTime, getPriorityDot } from '../../utils/communicationUtils';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onArchive?: () => void;
  onPin?: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
  onArchive,
  onPin,
}) => {
  const avatar = conversation.participantAvatars[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
  const name = conversation.type === 'broadcast'
    ? '📢 Broadcast'
    : conversation.participantNames.filter(n => n !== 'You').join(', ') || conversation.participantNames[0];

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-start gap-3 rounded-xl p-3.5 cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'bg-blue-50/80 border-blue-200/60 dark:bg-blue-950/30 dark:border-blue-800/50 shadow-sm'
          : conversation.isRead
          ? 'bg-white border-transparent hover:bg-zinc-50/80 hover:border-zinc-200/40 dark:bg-transparent dark:hover:bg-zinc-900/30 dark:hover:border-zinc-800/40'
          : 'bg-white border-zinc-200/40 hover:bg-zinc-50/80 dark:bg-zinc-900/20 dark:border-zinc-800/30 dark:hover:bg-zinc-900/40 shadow-sm'
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt={name}
          className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
        />
        {conversation.type === 'broadcast' && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-600 text-white text-[8px]">
            <Bell className="h-2.5 w-2.5" />
          </div>
        )}
        {!conversation.isRead && (
          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`truncate text-sm font-bold ${!conversation.isRead ? 'text-zinc-950 dark:text-zinc-50' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {name}
            </span>
            {conversation.isPinned && (
              <Pin className="h-3 w-3 text-blue-500 shrink-0" />
            )}
          </div>
          <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            {formatRelativeTime(conversation.lastMessageTime)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mt-0.5">
          <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${getPriorityDot(conversation.priority)}`} />
          <p className={`truncate text-xs ${!conversation.isRead ? 'font-semibold text-zinc-800 dark:text-zinc-200' : 'text-zinc-500 dark:text-zinc-400'}`}>
            {conversation.subject}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="truncate text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
            <span className="font-medium text-zinc-500 dark:text-zinc-400">{conversation.lastMessageSender}:</span>{' '}
            {conversation.lastMessage}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {conversation.hasAttachments && (
              <Paperclip className="h-3 w-3 text-zinc-400 dark:text-zinc-500" />
            )}
            {conversation.unreadCount > 0 && (
              <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Related task badge */}
        {conversation.relatedTaskTitle && (
          <div className="mt-1.5 flex items-center gap-1">
            <ArrowUp className="h-2.5 w-2.5 text-indigo-500" />
            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
              {conversation.relatedTaskTitle}
            </span>
          </div>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute right-2 top-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {onPin && (
          <button
            onClick={(e) => { e.stopPropagation(); onPin(); }}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <Pin className="h-3 w-3" />
          </button>
        )}
        {onArchive && (
          <button
            onClick={(e) => { e.stopPropagation(); onArchive(); }}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 transition-colors"
          >
            <Archive className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};