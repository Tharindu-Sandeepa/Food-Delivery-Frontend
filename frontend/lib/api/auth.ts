import api from './axios';
import { LoginFormData, RegisterFormData } from '../../lib/types/auth';

export const login = async (data: LoginFormData) => {
  const response = await api.post('/users/login', data);
  return response.data;
};

export const register = async (data: RegisterFormData) => {
  const response = await api.post('/users/register', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const logout = async () => {
  // You might need to implement this on backend too
  document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};