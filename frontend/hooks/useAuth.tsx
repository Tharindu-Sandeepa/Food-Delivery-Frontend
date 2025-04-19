"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User, LoginCredentials, RegisterData, AuthResponse } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  token: string | null // Add token here
  loading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (data: RegisterData) => Promise<AuthResponse>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database for demo purposes
const MOCK_USERS = [
  {
    id: "user1",
    name: "Customer User",
    email: "customer@example.com",
    password: "password",
    role: "customer",
  },
  {
    id: "abc123",
    name: "Restaurant Admin",
    email: "kasun@gmail.com",
    password: "123",
    role: "restaurant",
  },
  {
    id: "driver001",
    name: "Delivery Driver",
    email: "driver@gmail.com",
    password: "123",
    role: "driver",
  },
  {
    id: "user4",
    name: "System Admin",
    email: "admin@example.com",
    password: "password",
    role: "admin",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null) // Add token state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (token && storedUser) {
          setUser(JSON.parse(storedUser))
          setToken(token) // Set token from localStorage
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error("Authentication check failed:", err)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)
    try {
      const foundUser = MOCK_USERS.find((u) => u.email === credentials.email)

      if (!foundUser || foundUser.password !== credentials.password) {
        throw new Error("Invalid email or password")
      }

      const authenticatedUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role as "customer" | "restaurant" | "driver" | "admin",
      }

      const mockToken = "mock-jwt-token" // Simulated token
      setUser(authenticatedUser)
      setToken(mockToken) // Set token in state
      setIsAuthenticated(true)

      localStorage.setItem("user", JSON.stringify(authenticatedUser))
      localStorage.setItem("token", mockToken)

      return {
        token: mockToken,
        user: authenticatedUser,
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    setLoading(true)
    setError(null)
    try {
      if (MOCK_USERS.some((u) => u.email === data.email)) {
        throw new Error("Email already in use")
      }

      const newUser = {
        id: "user" + Math.random().toString(36).substr(2, 9),
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      }

      const registeredUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }

      const mockToken = "mock-jwt-token" // Simulated token
      setUser(registeredUser)
      setToken(mockToken) // Set token in state
      setIsAuthenticated(true)

      localStorage.setItem("user", JSON.stringify(registeredUser))
      localStorage.setItem("token", mockToken)

      return {
        token: mockToken,
        user: registeredUser,
      }
    } catch (err: any) {
      setError(err.message || "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    setToken(null) // Clear token
    setIsAuthenticated(false)
    router.push("/login")
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
