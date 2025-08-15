// Authentication store using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState } from '@/types';
import { 
  TOKEN_STORAGE_KEY, 
  REFRESH_TOKEN_STORAGE_KEY, 
  USER_STORAGE_KEY 
} from '@/constants';

interface AuthStore extends AuthState {
  // Actions
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (user: User, token: string, refreshToken?: string) => {
        // Store tokens in localStorage
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
        }

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
        }
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      clearAuth: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: USER_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useUserRole = () => useAuthStore((state) => state.user?.role);

// Helper functions
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true; // Consider invalid tokens as expired
  }
};

export const shouldRefreshToken = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    // Refresh if token expires in less than 5 minutes
    return timeUntilExpiry < 300;
  } catch (error) {
    return true;
  }
};