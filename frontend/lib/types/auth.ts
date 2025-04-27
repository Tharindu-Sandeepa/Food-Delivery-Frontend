import { User } from './user';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  address?: string;
  // restaurantId?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}
