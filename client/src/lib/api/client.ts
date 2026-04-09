import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  limit?: number;
  nextCursor?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

// Store for access token (in-memory for security)
let accessToken: string | null = null;

/**
 * Set access token for API requests
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/**
 * Get current access token
 */
export const getAccessToken = (): string | null => accessToken;

/**
 * Clear access token
 */
export const clearAccessToken = (): void => {
  accessToken = null;
};

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError<ApiError>): Promise<AxiosResponse> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data.success && response.data.data.accessToken) {
          setAccessToken(response.data.data.accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed - don't redirect if the request was for refresh endpoint itself
        // to avoid infinite redirect loops
        const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');
        if (!isRefreshRequest) {
          clearAccessToken();
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Generic GET request
 */
export const get = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }
  return response.data.data as T;
};

/**
 * Generic POST request
 */
export const post = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.post<ApiResponse<T>>(url, data);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }
  return response.data.data as T;
};

/**
 * Generic PATCH request
 */
export const patch = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await apiClient.patch<ApiResponse<T>>(url, data);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }
  return response.data.data as T;
};

/**
 * Generic DELETE request
 */
export const del = async <T>(url: string): Promise<T> => {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }
  return response.data.data as T;
};

export default apiClient;
