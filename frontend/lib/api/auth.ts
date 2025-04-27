import api from './axios';
import { LoginFormData, RegisterFormData, AuthResponse } from '../types/auth';
import { User } from '../types/user';

export const login = async (data: LoginFormData): Promise<AuthResponse> => {
  const response = await api.post('/users/login', data);
  return {
    success: response.data.success,
    token: response.data.token,
    user: { ...response.data.user, id: response.data.user._id },
  };
};

export const register = async (data: RegisterFormData): Promise<AuthResponse> => {
  const response = await api.post('/users/register', data);
  return {
    success: response.data.success,
    token: response.data.token,
    user: { ...response.data.user, id: response.data.user._id },
  };
};

export const getMe = async (token: string): Promise<User> => {
  const response = await api.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ...response.data.data, id: response.data.data._id };
};

export const logout = async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};