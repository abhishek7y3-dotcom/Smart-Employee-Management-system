'use client';

import {
  AuthUser,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
} from '../types/auth';

const STORAGE_KEYS = {
  users: 'mock_auth_users',
};

interface StoredUser extends AuthUser {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.users);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    window.localStorage.removeItem(STORAGE_KEYS.users);
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function createToken(): TokenResponse {
  return {
    accessToken: `mock-${Date.now()}`,
    expiresIn: 3600,
  };
}

function createError(message: string, status: number): Error {
  const error = new Error(message);
  Object.assign(error, { status });
  return error;
}

export async function registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const users = getStoredUsers();
  const existingUser = users.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());

  if (existingUser) {
    throw createError('A user with this email already exists.', 400);
  }

  const newUser: StoredUser = {
    id: `user-${Date.now()}`,
    name: payload.name,
    email: payload.email.toLowerCase(),
    role: 'member',
    password: payload.password,
  };

  saveStoredUsers([...users, newUser]);

  return {
    message: 'Registration successful. Please log in with your new account.',
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const users = getStoredUsers();
  const existingUser = users.find(
    (user) => user.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (!existingUser || existingUser.password !== payload.password) {
    throw createError('Invalid email or password.', 401);
  }

  return {
    user: {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role,
    },
    token: createToken(),
  };
}

export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  const users = getStoredUsers();
  const existingUser = users.find(
    (user) => user.email.toLowerCase() === payload.email.toLowerCase()
  );

  if (!existingUser) {
    throw createError('No account was found for this email address.', 404);
  }

  return {
    message: 'Password reset instructions have been sent to your email address.',
  };
}
