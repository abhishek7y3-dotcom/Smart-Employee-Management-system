'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sendChatMessage, getChatHistory, getArchivedChatsApi, getConversation, getLibraries, createLibrary, addChatToLibrary, createProject, getProjects, addChatToProject, deleteChatHistory, renameChatApi, pinChatApi, archiveChatApi } from '../services/chatbot/chatApi';
import { useAuth } from './AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatHistoryItem {
  _id: string;
  title: string;
  updatedAt: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface LibraryItem {
  _id: string;
  name: string;
  chats: ChatHistoryItem[];
}

export interface ProjectItem {
  _id: string;
  name: string;
  chats: ChatHistoryItem[];
  isPinned?: boolean;
  isArchived?: boolean;
}

interface ChatContextProps {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  conversationId: string | null;
  chatHistory: ChatHistoryItem[];
  libraries: LibraryItem[];
  projects: ProjectItem[];
  loadConversation: (id: string) => Promise<void>;
  startNewChat: (projectId?: string) => void;
  refreshHistory: () => Promise<void>;
  createNewLibrary: (name: string) => Promise<void>;
  addChatToLib: (libraryId: string, chatId: string) => Promise<void>;
  createNewProject: (name: string) => Promise<void>;
  addChatToProjectAction: (projectId: string, chatId: string) => Promise<void>;
  deleteMultipleChats: (chatIds: string[]) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  togglePinChat: (chatId: string) => Promise<void>;
  toggleArchiveChat: (chatId: string) => Promise<void>;
  renameProject: (projectId: string, name: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  togglePinProject: (projectId: string) => Promise<void>;
  toggleArchiveProject: (projectId: string) => Promise<void>;
  archivedChats: ChatHistoryItem[];
  refreshArchivedChats: () => Promise<void>;
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeProjectId, setActiveProject] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [archivedChats, setArchivedChats] = useState<ChatHistoryItem[]>([]);
  const [libraries, setLibraries] = useState<LibraryItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const { token } = useAuth();

  const refreshHistory = async () => {
    if (!token) return;
    try {
      const response = await getChatHistory(token);
      if (response.success) {
        const sortedHistory = response.data.sort((a: ChatHistoryItem, b: ChatHistoryItem) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        setChatHistory(sortedHistory);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    }
  };

  const refreshArchivedChats = async () => {
    if (!token) return;
    try {
      const response = await getArchivedChatsApi(token);
      if (response.success) {
        setArchivedChats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch archived history:', error);
    }
  };

  const refreshLibraries = async () => {
    if (!token) return;
    try {
      const response = await getLibraries(token);
      if (response.success) {
        setLibraries(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch libraries:', error);
    }
  };

  const refreshProjects = async () => {
    if (!token) return;
    try {
      const response = await getProjects(token);
      if (response.success) {
        const sortedProjects = response.data.sort((a: ProjectItem, b: ProjectItem) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return 0; // Maintain original order for unpinned
        });
        setProjects(sortedProjects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const createNewLibrary = async (name: string) => {
    if (!token) return;
    try {
      await createLibrary(token, name);
      await refreshLibraries();
    } catch (error) {
      console.error('Failed to create library:', error);
    }
  };

  const addChatToLib = async (libraryId: string, chatId: string) => {
    if (!token) return;
    try {
      await addChatToLibrary(token, libraryId, chatId);
      await refreshLibraries();
    } catch (error) {
      console.error('Failed to add chat to library:', error);
    }
  };

  const createNewProject = async (name: string) => {
    if (!token) return;
    try {
      await createProject(token, name);
      await refreshProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const addChatToProjectAction = async (projectId: string, chatId: string) => {
    if (!token) return;
    try {
      await addChatToProject(token, projectId, chatId);
      await refreshProjects();
    } catch (error) {
      console.error('Failed to add chat to project:', error);
    }
  };

  const deleteMultipleChats = async (chatIds: string[]) => {
    if (!token) return;
    try {
      await Promise.all(chatIds.map(id => deleteChatHistory(token, id)));
      if (conversationId && chatIds.includes(conversationId)) {
        startNewChat();
      }
      await refreshHistory();
      await refreshProjects();
      await refreshLibraries();
    } catch (error) {
      console.error('Failed to delete chats:', error);
    }
  };

  const renameChat = async (chatId: string, title: string) => {
    if (!token) return;
    try {
      await renameChatApi(token, chatId, title);
      await refreshHistory();
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
  };

  const togglePinChat = async (chatId: string) => {
    if (!token) return;
    try {
      await pinChatApi(token, chatId);
      await refreshHistory();
    } catch (error) {
      console.error('Failed to pin chat:', error);
    }
  };

  const toggleArchiveChat = async (chatId: string) => {
    if (!token) return;
    try {
      await archiveChatApi(token, chatId);
      await refreshHistory();
      await refreshArchivedChats();
      if (conversationId === chatId) {
        startNewChat();
      }
    } catch (error) {
      console.error('Failed to archive chat:', error);
    }
  };

  const renameProject = async (projectId: string, name: string) => {
    if (!token) return;
    try {
      await import('../services/chatbot/chatApi').then(api => api.renameProjectApi(token, projectId, name));
      await refreshProjects();
    } catch (error) {
      console.error('Failed to rename project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!token) return;
    try {
      await import('../services/chatbot/chatApi').then(api => api.deleteProjectApi(token, projectId));
      await refreshProjects();
      if (activeProjectId === projectId) {
        setActiveProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const togglePinProject = async (projectId: string) => {
    if (!token) return;
    try {
      await import('../services/chatbot/chatApi').then(api => api.pinProjectApi(token, projectId));
      await refreshProjects();
    } catch (error) {
      console.error('Failed to pin project:', error);
    }
  };

  const toggleArchiveProject = async (projectId: string) => {
    if (!token) return;
    try {
      await import('../services/chatbot/chatApi').then(api => api.archiveProjectApi(token, projectId));
      await refreshProjects();
      if (activeProjectId === projectId) {
        setActiveProject(null);
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  // Load history and libraries on mount if token exists
  useEffect(() => {
    refreshHistory();
    refreshArchivedChats();
    refreshLibraries();
    refreshProjects();
  }, [token]);

  const loadConversation = async (id: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await getConversation(token, id);
      if (response.success && response.data) {
        setConversationId(response.data.conversationId);

        // Map backend format to frontend format
        const loadedMessages = response.data.messages.map((msg: any) => ({
          id: msg._id,
          role: msg.role === 'model' ? 'assistant' : msg.role,
          content: msg.content,
          timestamp: msg.createdAt
        }));

        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = (projectId?: string) => {
    setMessages([]);
    setConversationId(null);
    if (projectId) {
      setActiveProject(projectId);
    } else {
      setActiveProject(null); // Clear active project unless explicitly starting in a project
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    let messageText = text;
    let attachmentData = undefined;

    // Check if the text contains our custom attachment string
    const match = text.match(/^\[ATTACHMENT:(.*?)\]([\s\S]*)/);
    if (match) {
      try {
        attachmentData = JSON.parse(match[1]);
        messageText = match[2];
      } catch (e) {
        console.error("Failed to parse attachment", e);
      }
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: attachmentData ? `[Attached: ${attachmentData.name}]\n\n${messageText}` : messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (!token) throw new Error('Not authenticated');

      const response = await sendChatMessage(messageText, token, conversationId || undefined, attachmentData);

      if (response.success && response.data) {
        const isNewConversation = !conversationId;

        if (isNewConversation) {
          setConversationId(response.data.conversationId);
          if (activeProjectId) {
            await addChatToProjectAction(activeProjectId, response.data.conversationId);
          }
          refreshHistory(); // Refresh sidebar to show new chat
        }

        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: response.data.message.role,
          content: response.data.message.content,
          timestamp: response.data.message.timestamp,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Dispatch real-time system events if the AI updated any backend state
        if (response.data.systemEvents && Array.isArray(response.data.systemEvents)) {
          response.data.systemEvents.forEach((event: string) => {
            window.dispatchEvent(new Event(event));
          });
        }
      }
    } catch (error: any) {
      console.error('Chat Error:', error);
      const apiError = error?.response?.data?.message;
      const fallbackError = 'Sorry, this request does not seem related to Employee Task Management, or an error occurred processing the file. Please ask a relevant question.';
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: apiError || fallbackError,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, conversationId, chatHistory, archivedChats, libraries, projects, loadConversation, startNewChat, refreshHistory, refreshArchivedChats, createNewLibrary, addChatToLib, createNewProject, addChatToProjectAction, deleteMultipleChats, renameChat, togglePinChat, toggleArchiveChat, renameProject, deleteProject, togglePinProject, toggleArchiveProject, activeProjectId, setActiveProject }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
