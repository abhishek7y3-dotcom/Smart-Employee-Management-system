'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  forgotPassword as forgotPasswordApi,
  loginUser,
  registerUser,
  resetPassword as resetPasswordApi,
} from '../api/auth';
import {
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
} from '../types/auth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<string>;
  forgotPassword: (payload: ForgotPasswordRequest) => Promise<string>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEYS = {
  user: 'auth_user',
  token: 'auth_token',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setInitializing(false);
      return;
    }

    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEYS.user);
    const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEYS.token);

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEYS.user);
        localStorage.removeItem(AUTH_STORAGE_KEYS.token);
      }
    }

    setInitializing(false);
  }, []);

  const persistAuth = useCallback((authUser: AuthUser, authToken: string) => {
    setUser(authUser);
    setToken(authToken);
    window.localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(authUser));
    window.localStorage.setItem(AUTH_STORAGE_KEYS.token, authToken);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.user);
    window.localStorage.removeItem(AUTH_STORAGE_KEYS.token);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response: LoginResponse = await loginUser(credentials);
      persistAuth(response.user, response.token.accessToken);
      router.push('/');
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [persistAuth, router]);

  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response: RegisterResponse = await registerUser(data);
      return response.message;
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (payload: ForgotPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await forgotPasswordApi(payload);
      return response.message;
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (payload: ResetPasswordRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await resetPasswordApi(payload);
      return response.message;
    } catch (apiError) {
      setError(getFriendlyErrorMessage(apiError));
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  const isAuthenticated = Boolean(user && token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        initializing,
        error,
        login,
        logout,
        register,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const errorWithStatus = error as Error & { status?: number };
    // If the error message is a specific message from the server, use it
    if (error.message && error.message !== 'An unexpected error occurred. Please try again.') {
      return error.message;
    }
    if (typeof errorWithStatus.status === 'number') {
      switch (errorWithStatus.status) {
        case 400:
          return error.message;
        case 401:
          return 'Unauthorized. Please log in again.';
        case 403:
          return 'Forbidden. You do not have access.';
        case 404:
          return 'Server resource not found.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return error.message;
      }
    }

    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
