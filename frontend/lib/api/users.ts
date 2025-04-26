import api from './axios';
import { User } from '../types/user';

interface FetchUsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface UpdateUserData {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string;
  password: string;
}

export const fetchUsers = async (
  token: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<FetchUsersResponse> => {
  const response = await api.get('/users', {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });
  const mappedData = response.data.data.map((user: any) => ({
    ...user,
    id: user._id,
  }));
  return {
    success: response.data.success,
    data: mappedData,
    pagination: response.data.pagination,
  };
};

export const updateUserStatus = async (
  token: string,
  userId: string,
  isActive: boolean
): Promise<User> => {
  const response = await api.put(`/users/${userId}`, { isActive }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ...response.data.data, id: response.data.data._id };
};

export const updateUserRole = async (
  token: string,
  userId: string,
  role: string
): Promise<User> => {
  const response = await api.put(`/users/${userId}`, { role }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ...response.data.data, id: response.data.data._id };
};

export const updateUser = async (
  token: string,
  userId: string,
  data: UpdateUserData
): Promise<User> => {
  const response = await api.put(`/users/${userId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ...response.data.data, id: response.data.data._id };
};

export const deleteUser = async (
  token: string,
  userId: string
): Promise<void> => {
  await api.delete(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getCurrentUser = async (token: string): Promise<User> => {
  const response = await api.get('/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ...response.data.data, id: response.data.data._id };
};

export const updateCurrentUser = async (
  token: string,
  data: UpdateUserData
): Promise<User> => {
  const response = await api.put('/users/updatedetails', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ...response.data.data, id: response.data.data._id };
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post('/users/forgotpassword', { email });
  return response.data;
};

export const resetPassword = async (
  token: string,
  password: string
): Promise<{ token: string; user: User }> => {
  const response = await api.put(`/users/resetpassword/${token}`, { password });
  return {
    token: response.data.token,
    user: { ...response.data.user, id: response.data.user._id },
  };
};

export const createUser = async (
  token: string,
  data: CreateUserData
): Promise<User> => {
  const response = await api.post('/users', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { ...response.data.data, id: response.data.data._id };
};