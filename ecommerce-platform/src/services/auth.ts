// Authentication service

import { apiClient } from './api';
import type { 
  User, 
  LoginCredentials, 
  RegisterData, 
  UserAddress 
} from '@/types';

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export const authService = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  register: async (data: RegisterData): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/register', data);
  },

  logout: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout');
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', { refreshToken });
  },

  // Password management
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>('/auth/change-password', data);
  },

  // Email verification
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/verify-email', { token });
  },

  resendVerificationEmail: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/resend-verification', { email });
  },

  // Profile management
  getProfile: async (): Promise<User> => {
    return apiClient.get<User>('/auth/profile');
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    return apiClient.put<User>('/auth/profile', data);
  },

  deleteAccount: async (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/auth/profile');
  },

  // Address management
  getAddresses: async (): Promise<UserAddress[]> => {
    return apiClient.get<UserAddress[]>('/auth/addresses');
  },

  createAddress: async (address: Omit<UserAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserAddress> => {
    return apiClient.post<UserAddress>('/auth/addresses', address);
  },

  updateAddress: async (
    addressId: string, 
    address: Partial<Omit<UserAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<UserAddress> => {
    return apiClient.put<UserAddress>(`/auth/addresses/${addressId}`, address);
  },

  deleteAddress: async (addressId: string): Promise<void> => {
    return apiClient.delete<void>(`/auth/addresses/${addressId}`);
  },

  setDefaultAddress: async (addressId: string, type: 'shipping' | 'billing' | 'both'): Promise<UserAddress> => {
    return apiClient.patch<UserAddress>(`/auth/addresses/${addressId}/default`, { type });
  },

  // Account verification and security
  requestEmailChange: async (newEmail: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/change-email', { newEmail });
  },

  confirmEmailChange: async (token: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/confirm-email-change', { token });
  },

  enableTwoFactor: async (): Promise<{ qrCode: string; secret: string }> => {
    return apiClient.post<{ qrCode: string; secret: string }>('/auth/2fa/enable');
  },

  verifyTwoFactor: async (token: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/2fa/verify', { token });
  },

  disableTwoFactor: async (token: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/2fa/disable', { token });
  },

  // Session management
  getSessions: async (): Promise<Array<{
    id: string;
    deviceInfo: string;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
    lastUsed: Date;
    createdAt: Date;
  }>> => {
    return apiClient.get('/auth/sessions');
  },

  revokeSession: async (sessionId: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/auth/sessions/${sessionId}`);
  },

  revokeAllSessions: async (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>('/auth/sessions');
  },

  // Social authentication (if implemented)
  googleAuth: async (token: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/google', { token });
  },

  facebookAuth: async (token: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/facebook', { token });
  },

  githubAuth: async (code: string): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>('/auth/github', { code });
  },
};