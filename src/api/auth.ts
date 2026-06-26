'use client';

import axiosInstance from '../services/axios';
import {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth';
import {
  forgotPassword as mockForgotPassword,
  loginUser as mockLoginUser,
  registerUser as mockRegisterUser,
} from './mockAuth';

function isMockAuthEnabled(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem('use_mock_auth') === 'true';
}

export async function registerUser(
  payload: RegisterRequest
): Promise<RegisterResponse> {
  if (isMockAuthEnabled()) {
    return mockRegisterUser(payload);
  }

  try {
    const response = await axiosInstance.post<any>('/auth/register', payload);
    const apiData = response.data;
    return {
      message: apiData.message || 'Registration successful.',
      user: apiData.data?.user || apiData.user
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  if (isMockAuthEnabled()) {
    return mockLoginUser(payload);
  }

  try {
    const response = await axiosInstance.post<any>('/auth/login', payload);
    const apiData = response.data.data;
    return {
      user: apiData.user,
      token: {
        accessToken: apiData.token,
        expiresIn: 3600
      }
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function forgotPassword(
  payload: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> {
  if (isMockAuthEnabled()) {
    return mockForgotPassword(payload);
  }

  try {
    const response = await axiosInstance.post<any>('/auth/forgot-password', payload);
    return {
      message: response.data.message || 'Reset link sent successfully.'
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function resetPassword(
  payload: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock password reset successful.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/reset-password', payload);
    return {
      message: response.data.message || 'Password has been reset successfully.'
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function verifyOtp(email: string, otp: string): Promise<{ message: string }> {
  if (isMockAuthEnabled()) {
    return { message: 'Mock OTP verified successfully.' };
  }

  try {
    const response = await axiosInstance.post<any>('/auth/verify-otp', { email, otp });
    return {
      message: response.data.message || 'Verification successful.'
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function updateUserProfile(
  id: string,
  payload: { role?: string; designation?: string }
): Promise<any> {
  if (isMockAuthEnabled()) {
    return { id, ...payload };
  }

  try {
    const response = await axiosInstance.put<any>(`/auth/users/${id}`, payload);
    return response.data.data.user;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
export async function removeUser(id: string): Promise<any> {
  if (isMockAuthEnabled()) {
    return { success: true };
  }

  try {
    const response = await axiosInstance.delete<any>(`/auth/users/${id}`);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}


function normalizeApiError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Unable to process request. Please try again later.');
}
