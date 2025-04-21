"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../lib/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoginFormData, RegisterFormData } from "../../lib/types/auth"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { login, register, loading, error } = useAuth()
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

  // Login form
  const { 
    register: loginRegister, 
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors }
  } = useForm<LoginFormData>()

  // Register form
  const { 
    register: registerRegister, 
    handleSubmit: handleRegisterSubmit,
    watch,
    formState: { errors: registerErrors }
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: "customer"
    }
  })

  const selectedRole = watch("role")

  const onLogin = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password)
      router.push("/") // Will be redirected based on role via middleware
    } catch (err) {
      console.error("Login error:", err)
    }
  }

  const onRegister = async (data: RegisterFormData) => {
    try {
      await register(data)
      router.push("/") // Will be redirected based on role via middleware
    } catch (err) {
      console.error("Registration error:", err)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {activeTab === "login" 
              ? "Sign in to continue" 
              : "Join our food community"}
          </CardDescription>
        </CardHeader>

        <Tabs 
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "login" | "register")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="mx-4 mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit(onLogin)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    {...loginRegister("email", { required: "Email is required" })}
                    placeholder="your@email.com"
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginRegister("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    placeholder="••••••••"
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>
              </CardContent>
              <CardContent>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </CardContent>
            </form>
          </TabsContent>

          {/* Registration Form */}
          <TabsContent value="register">
            <form onSubmit={handleRegisterSubmit(onRegister)}>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    {...registerRegister("name", { required: "Name is required" })}
                    placeholder="John Doe"
                  />
                  {registerErrors.name && (
                    <p className="text-sm text-destructive">{registerErrors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    {...registerRegister("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
                    placeholder="your@email.com"
                  />
                  {registerErrors.email && (
                    <p className="text-sm text-destructive">{registerErrors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    {...registerRegister("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    placeholder="••••••••"
                  />
                  {registerErrors.password && (
                    <p className="text-sm text-destructive">{registerErrors.password.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone Number</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    {...registerRegister("phone", { 
                      required: "Phone number is required",
                      pattern: {
                        value: /^\+?\d{10,15}$/,
                        message: "Invalid phone number"
                      }
                    })}
                    placeholder="+1234567890"
                  />
                  {registerErrors.phone && (
                    <p className="text-sm text-destructive">{registerErrors.phone.message}</p>
                  )}
                </div>

                {/* Role Selector */}
                <div className="space-y-2">
                  <Label htmlFor="register-role">Register As</Label>
                  <Select
                    {...registerRegister("role", { required: "Role is required" })}
                  >
                    <SelectTrigger id="register-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="restaurant">Restaurant</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Address - Conditionally shown for customer/delivery */}
                {(selectedRole === "customer" || selectedRole === "delivery") && (
                  <div className="space-y-2">
                    <Label htmlFor="register-address">Address</Label>
                    <Input
                      id="register-address"
                      {...registerRegister("address", { 
                        required: selectedRole === "customer" || selectedRole === "delivery" 
                          ? "Address is required" 
                          : false
                      })}
                      placeholder="123 Main St, City"
                    />
                    {registerErrors.address && (
                      <p className="text-sm text-destructive">{registerErrors.address.message}</p>
                    )}
                  </div>
                )}

                {/* Restaurant ID - Conditionally shown for restaurant */}
                {selectedRole === "restaurant" && (
                  <div className="space-y-2">
                    <Label htmlFor="register-restaurantId">Restaurant ID</Label>
                    <Input
                      id="register-restaurantId"
                      {...registerRegister("restaurantId", { 
                        required: selectedRole === "restaurant" 
                          ? "Restaurant ID is required" 
                          : false
                      })}
                      placeholder="Restaurant identifier"
                    />
                    {registerErrors.restaurantId && (
                      <p className="text-sm text-destructive">{registerErrors.restaurantId.message}</p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardContent>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Register"}
                </Button>
              </CardContent>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}