// Base API service configuration

import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError 
} from 'axios';
import { API_BASE_URL, API_VERSION, ERROR_MESSAGES } from '@/constants';
import { getToken, getRefreshToken, useAuthStore } from '@/store/auth';
import type { ApiResponse } from '@/types';

// Create axios instance
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: `${API_BASE_URL}/${API_VERSION}`,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
};

export const api = createApiInstance();

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/${API_VERSION}/auth/refresh`, {
            refreshToken,
          });

          const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
          
          // Update tokens in store
          const authStore = useAuthStore.getState();
          const user = authStore.user;
          if (user) {
            authStore.login(user, newToken, newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        const authStore = useAuthStore.getState();
        authStore.logout();
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// API response wrapper
export const handleApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>): T => {
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  throw new Error(response.data.error || ERROR_MESSAGES.GENERIC_ERROR);
};

// API error handler
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    
    // Network error
    if (!axiosError.response) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }

    // Server returned error response
    const { status } = axiosError.response;
    const errorData = axiosError.response.data;

    switch (status) {
      case 400:
        throw new Error(errorData?.error || ERROR_MESSAGES.VALIDATION_ERROR);
      case 401:
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      case 403:
        throw new Error(ERROR_MESSAGES.FORBIDDEN);
      case 404:
        throw new Error(ERROR_MESSAGES.NOT_FOUND);
      case 408:
        throw new Error(ERROR_MESSAGES.TIMEOUT_ERROR);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      default:
        throw new Error(errorData?.error || ERROR_MESSAGES.GENERIC_ERROR);
    }
  }

  throw new Error(ERROR_MESSAGES.GENERIC_ERROR);
};

// Generic API methods
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.get<ApiResponse<T>>(url, config);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  post: async <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response = await api.post<ApiResponse<T>>(url, data, config);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  put: async <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response = await api.put<ApiResponse<T>>(url, data, config);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  patch: async <T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<T> => {
    try {
      const response = await api.patch<ApiResponse<T>>(url, data, config);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await api.delete<ApiResponse<T>>(url, config);
      return handleApiResponse(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

// File upload helper
export const uploadFile = async (
  url: string,
  file: File,
  fieldName: string = 'file',
  onUploadProgress?: (progressEvent: any) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    const response = await api.post<ApiResponse<{ url: string }>>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    
    return handleApiResponse(response).url;
  } catch (error) {
    return handleApiError(error);
  }
};

// Multiple file upload helper
export const uploadFiles = async (
  url: string,
  files: File[],
  fieldName: string = 'files',
  onUploadProgress?: (progressEvent: any) => void
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append(fieldName, file);
  });

  try {
    const response = await api.post<ApiResponse<{ urls: string[] }>>(
      url,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    
    return handleApiResponse(response).urls;
  } catch (error) {
    return handleApiError(error);
  }
};

export default apiClient;