import { api } from "./api"

export interface User {
  id: string
  name: string
  email: string
  role: "customer" | "restaurant" | "driver" | "admin"
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  role: "customer" | "restaurant" | "driver" | "admin"
}

export interface AuthResponse {
  token: string
  user: User
}

// Authentication service
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await api.post("/auth/login", credentials)

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token)
    }

    return data
  },

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const data = await api.post("/auth/register", userData)

    // Store token in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token)
    }

    return data
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    return api.get("/auth/profile")
  },

  // Logout user
  logout() {
    localStorage.removeItem("token")
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token")
  },

  // Get current user role
  getUserRole(): string | null {
    const user = localStorage.getItem("user")
    if (user) {
      return JSON.parse(user).role
    }
    return null
  },
}
