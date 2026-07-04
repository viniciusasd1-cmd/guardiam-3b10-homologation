import { apiRequest } from './apiClient';
import { AuthResponse } from '../types/auth';

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export function login(input: LoginInput) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
  });
}

export function register(input: RegisterInput) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export function me(token: string) {
  return apiRequest<{ status: string; user: AuthResponse['user'] }>('/auth/me', {
    token,
  });
}
