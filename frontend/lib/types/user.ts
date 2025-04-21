// In your types/user.ts file, update the User interface:
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "inactive" | "blocked";
  createdAt: string;
  token?: string; // Make it optional since it might not always be present
}
  
  export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin';
  
  export interface UserResponse {
    success: boolean;
    data: {
      user: User;
    };
  }
  
  export interface UsersResponse {
    success: boolean;
    count: number;
    data: User[];
  }
  
  export interface UserUpdateData {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }
  
  export interface PasswordUpdateData {
    currentPassword: string;
    newPassword: string;
  }