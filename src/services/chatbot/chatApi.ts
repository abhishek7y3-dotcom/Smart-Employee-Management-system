import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const sendChatMessage = async (message: string, token: string, conversationId?: string, attachment?: { name: string, content: string, mimeType: string }) => {
  const response = await axios.post(
    `${API_BASE_URL}/chat`,
    { message, conversationId, attachment },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getChatHistory = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/chat/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getArchivedChatsApi = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/chat/archived`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getConversation = async (token: string, conversationId: string) => {
  const response = await axios.get(`${API_BASE_URL}/chat/history/${conversationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createProject = async (token: string, name: string) => {
  const response = await axios.post(`${API_BASE_URL}/chat/project`, { name }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getProjects = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/chat/project`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createLibrary = async (token: string, name: string) => {
  const response = await axios.post(`${API_BASE_URL}/chat/library`, { name }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getLibraries = async (token: string) => {
  const response = await axios.get(`${API_BASE_URL}/chat/library`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addChatToLibrary = async (token: string, libraryId: string, chatId: string) => {
  const response = await axios.post(`${API_BASE_URL}/chat/library/${libraryId}/chat`, { chatId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addChatToProject = async (token: string, projectId: string, chatId: string) => {
  const response = await axios.post(`${API_BASE_URL}/chat/project/${projectId}/chat`, { chatId }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const renameProjectApi = async (token: string, projectId: string, name: string) => {
  const response = await axios.put(`${API_BASE_URL}/chat/project/${projectId}/rename`, { name }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteProjectApi = async (token: string, projectId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/chat/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const pinProjectApi = async (token: string, projectId: string) => {
  const response = await axios.put(`${API_BASE_URL}/chat/project/${projectId}/pin`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const archiveProjectApi = async (token: string, projectId: string) => {
  const response = await axios.put(`${API_BASE_URL}/chat/project/${projectId}/archive`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteChatHistory = async (token: string, chatId: string) => {
  const response = await axios.delete(`${API_BASE_URL}/chat/history/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const renameChatApi = async (token: string, chatId: string, title: string) => {
  const response = await axios.put(`${API_BASE_URL}/chat/history/${chatId}/rename`, { title }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const pinChatApi = async (token: string, chatId: string) => {
  const response = await axios.put(`${API_BASE_URL}/chat/history/${chatId}/pin`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const archiveChatApi = async (token: string, chatId: string) => {
  const response = await axios.put(`${API_BASE_URL}/chat/history/${chatId}/archive`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
