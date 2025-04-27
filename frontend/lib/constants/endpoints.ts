export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api/v1';

export const AUTH_ENDPOINTS = {
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  ME: '/users/me',
};

export const USER_ENDPOINTS = {
  BASE: '/users',
  BY_ID: (id: string) => `/users/${id}`,
};