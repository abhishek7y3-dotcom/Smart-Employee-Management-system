'use client';
import React, { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatSidebar } from './ChatSidebar';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { LibraryView } from './LibraryView';
import { ProjectView } from './ProjectView';
import { ChatsListView } from './ChatsListView';
import { ArchiveView } from './ArchiveView';
import { ProjectDetailView } from './ProjectDetailView';

export const ChatLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<'chat' | 'chats_list' | 'library' | 'project' | 'archive' | 'project_detail'>('chat');

  return (
    <div className="h-full w-full flex bg-white dark:bg-zinc-950 overflow-hidden relative">
      
      {/* Sidebar */}
      {isSidebarOpen && (
        <ChatSidebar 
          onClose={() => setIsSidebarOpen(false)} 
          onOpenLibrary={() => setCurrentView('library')}
          onOpenChat={() => setCurrentView('chat')}
          onOpenChatsList={() => setCurrentView('chats_list')}
          onOpenProjects={() => setCurrentView('project')}
          onOpenArchive={() => setCurrentView('archive')}
          onOpenProjectDetail={() => setCurrentView('project_detail')}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Top Header - Minimal */}
        <div className="flex-none h-14 px-4 flex items-center sticky top-0 z-10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm gap-2">
          {!isSidebarOpen && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              title="Open sidebar"
            >
              <PanelLeftOpen size={20} />
            </button>
          )}
          {currentView === 'chat' && (
            <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 pl-2">
              AI Assistant
            </h1>
          )}
        </div>
        
        {/* Main Interface */}
        <div className="flex-1 overflow-hidden relative">
          {currentView === 'chat' && <ChatWindow />}
          {currentView === 'chats_list' && <ChatsListView onOpenChat={() => setCurrentView('chat')} />}
          {currentView === 'library' && <LibraryView />}
          {currentView === 'project' && <ProjectView onOpenProjectDetail={() => setCurrentView('project_detail')} />}
          {currentView === 'archive' && <ArchiveView onOpenChat={() => setCurrentView('chat')} />}
          {currentView === 'project_detail' && <ProjectDetailView onOpenChat={() => setCurrentView('chat')} />}
        </div>
      </div>
      
    </div>
  );
};
