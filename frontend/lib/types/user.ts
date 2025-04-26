export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  phone: string;
  address?: string;
  
}

export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin';