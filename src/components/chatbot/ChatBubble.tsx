import React from 'react';
import { Sparkles, User } from 'lucide-react';

export const ChatBubble = ({ role, content, timestamp }: { role: string; content: string; timestamp: string }) => {
  const isUser = role === 'user';
  const isSystem = role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full mb-6 justify-start group">
      <div className="flex flex-row items-start gap-4 max-w-3xl w-full">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${isUser ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300' : 'bg-white border border-zinc-200 text-zinc-900 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100'}`}>
          {isUser ? <User size={16} /> : <Sparkles size={16} />}
        </div>
        
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-zinc-900 dark:text-zinc-100 text-[15px] pt-1">
            <div className="whitespace-pre-wrap leading-relaxed font-normal">{content}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
