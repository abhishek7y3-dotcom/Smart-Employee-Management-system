'use client';

import axios, { AxiosError, AxiosInstance } from 'axios';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!apiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is not defined. Please set it in .env.local');
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<Record<string, unknown>>) => {
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

      // Auto-logout on 401: stale or invalid token (e.g. user deleted from DB)
      if (status === 401 && typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        // Only clear and redirect if not already on an auth page
        if (!['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath)) {
          window.localStorage.removeItem('auth_token');
          window.localStorage.removeItem('auth_user');
          window.location.href = '/login';
        }
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
