import axios, { AxiosError } from 'axios';
import { getToken, clearToken } from '../lib/token';
import type { ApiErrorResponse, FieldError } from '../types/api';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
});

// attach the JWT to every request when a session exists
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// invalid/expired session: drop the token and send the user back to login.
// The token check avoids redirect loops on failed login attempts (also 401).
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401 && getToken()) {
      clearToken();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

// Display message for any error thrown by the api client
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) return 'Cannot reach the server. Please try again.';
    return error.response.data?.message ?? 'Something went wrong';
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};

// Field-level validation errors (backend "Validation failed" responses)
export const getFieldErrors = (error: unknown): FieldError[] => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.errors ?? [];
  }
  return [];
};
