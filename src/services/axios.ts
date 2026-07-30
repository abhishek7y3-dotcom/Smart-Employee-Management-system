'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined. Please set it in .env.local');
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Token is now managed by HttpOnly cookies automatically attached by the browser
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Record<string, unknown>>) => {
    const originalRequest = error.config as any;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as Record<string, unknown> | undefined;
      let message = typeof data?.message === 'string' ? data.message : '';
      
      if (data && Array.isArray(data.errors) && data.errors.length > 0) {
        const errorDetails = data.errors
          .map((err: any) => err.message)
          .filter(Boolean)
          .join(', ');
        if (errorDetails) {
          message = `${message}: ${errorDetails}`;
        }
      }

      if (!message) {
        message = 'An unexpected error occurred. Please try again.';
      }

      // Handle 401 Unauthorized for Refresh Token logic
      if (status === 401 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath);
        
        // If it's a 401 and we haven't already retried this request
        if (!originalRequest._retry && !isAuthRoute) {
          originalRequest._retry = true;
          
          try {
            // Attempt silent refresh
            await axios.post(`${apiBaseUrl}/auth/refresh`, {}, { withCredentials: true });
            
            // If successful, retry the original request
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, token is actually dead. Log them out.
            window.localStorage.removeItem('auth_user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else if (!isAuthRoute) {
            window.localStorage.removeItem('auth_user');
            window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden (e.g. Account deactivated by Admin)
      if (status === 403 && typeof window !== 'undefined') {
        alert(message || 'Your account has been deactivated by an administrator.');
        window.localStorage.removeItem('auth_user');
        window.location.href = '/login';
      }

      const normalizedError = new Error(message);
      Object.assign(normalizedError, { status });
      return Promise.reject(normalizedError);
    }

    if (error.request) {
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }

    return Promise.reject(new Error(error.message));
  }
);

export default axiosInstance;
