"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const auth = useAuth()

  const { login, register } = auth
  const { toast } = useToast()

  // Login form state - removed role selection
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Register form state - kept role selection
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer" as "customer" | "restaurant" | "driver" | "admin",
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Login without specifying role - it will be returned from the backend
      const result = await login({
        email: loginData.email,
        password: loginData.password,
      })

      toast({
        title: "Login successful",
        description: "You have been logged in successfully",
      })

      // Redirect based on the role returned from the backend
      const userRole = result.user.role
      if (userRole === "customer") {
        router.push("/")
      } else if (userRole === "restaurant") {
        router.push("/admin")
      } else if (userRole === "driver") {
        router.push("/delivery")
      } else if (userRole === "admin") {
        router.push("/admin-system")
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
      })

      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      })

      // Redirect based on the role from registration
      const userRole = result.user.role
      if (userRole === "customer") {
        router.push("/")
      } else if (userRole === "restaurant") {
        router.push("/admin")
      } else if (userRole === "driver") {
        router.push("/delivery")
      } else if (userRole === "admin") {
        router.push("/admin-system")
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => router.push("/")} className="text-lg font-bold text-primary">
          FoodDash
        </Button>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <Tabs defaultValue="login">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={registerData.name}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={registerData.email}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-role">Register as</Label>
                  <Select
                    value={registerData.role}
                    onValueChange={(value) => setRegisterData((prev) => ({ ...prev, role: value as "customer" | "restaurant" | "driver" | "admin" }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="restaurant">Restaurant Admin</SelectItem>
                      <SelectItem value="driver">Delivery Personnel</SelectItem>
                      <SelectItem value="admin">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
