import { apiClient } from './client';
import type { User } from '../types/user';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const registerApi = async (input: RegisterInput): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/register', input);
  return res.data;
};

export const loginApi = async (input: LoginInput): Promise<AuthResponse> => {
  const res = await apiClient.post<AuthResponse>('/auth/login', input);
  return res.data;
};

export const getMeApi = async (): Promise<User> => {
  const res = await apiClient.get<{ user: User }>('/auth/me');
  return res.data.user;
};
