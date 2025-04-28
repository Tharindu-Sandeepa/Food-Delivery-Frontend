"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LoginFormData, RegisterFormData } from "@/lib/types/auth";
import { useForm, Controller } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Mail } from "lucide-react";

interface ForgotPasswordFormData {
  email: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, forgotPassword, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>();

  // Register form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    control,
    watch,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: "customer",
    },
  });

  // Forgot password form
  const {
    register: forgotRegister,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm<ForgotPasswordFormData>();

  const selectedRole = watch("role");

  // Reusable function for role-based redirection
  const redirectByRole = (role: string) => {
    switch (role) {
      case "customer":
        router.push("/");
        break;
      case "admin":
        router.push("/admin-system");
        break;
      case "restaurant":
        router.push("/admin");
        break;
      case "delivery":
        router.push("/delivery");
        break;
      default:
        console.warn(`Unknown role: ${role}`);
        router.push("/");
    }
  };

  const onLogin = async (data: LoginFormData) => {
    try {
      const response = await signIn(data);
      const { role } = response.user;
      redirectByRole(role);
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        title: "Login Failed",
        description: err.response?.data?.error || "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    console.log("Register data:", data);
    try {
      const response = await signUp(data);
      const { role } = response.user;
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      redirectByRole(role);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast({
        title: "Registration Failed",
        description: err.response?.data?.error || "Unable to connect to the server. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onForgotPassword = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword(data.email);
      setIsForgotPasswordOpen(false);
      resetForgotForm();
      toast({
        title: "Success",
        description: "A password reset email has been sent to your email address.",
      });
    } catch (err: any) {
      console.error("Forgot password error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to send reset email.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription>
            {activeTab === "login" ? "Sign in to continue" : "Join our food community"}
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
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    placeholder="••••••••"
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password.message}</p>
                  )}
                </div>
                <div className="text-right">
                  <Button
                    variant="link"
                    type="button"
                    className="text-sm text-primary"
                    onClick={() => setIsForgotPasswordOpen(true)}
                  >
                    Forgot Password?
                  </Button>
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
                        message: "Invalid email address",
                      },
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
                        message: "Password must be at least 6 characters",
                      },
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
                        message: "Invalid phone number",
                      },
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
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                    )}
                  />
                  {registerErrors.role && (
                    <p className="text-sm text-destructive">{registerErrors.role.message}</p>
                  )}
                </div>

                {/* Address - Conditionally shown for customer/delivery */}
                {(selectedRole === "customer" || selectedRole === "delivery") && (
                  <div className="space-y-2">
                    <Label htmlFor="register-address">Address</Label>
                    <Input
                      id="register-address"
                      {...registerRegister("address", {
                        required:
                          selectedRole === "customer" || selectedRole === "delivery"
                            ? "Address is required"
                            : false,
                      })}
                      placeholder="123 Main St, City"
                    />
                    {registerErrors.address && (
                      <p className="text-sm text-destructive">{registerErrors.address.message}</p>
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

        {/* Forgot Password Dialog */}
        <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleForgotSubmit(onForgotPassword)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    {...forgotRegister("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    placeholder="your@email.com"
                  />
                  {forgotErrors.email && (
                    <p className="text-sm text-destructive">{forgotErrors.email.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Email"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}