"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const { resetPassword, loading, error } = useAuth();
  const router = useRouter();
  const { token } = useParams();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const password = watch("password");

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

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await resetPassword(token as string, data.password);
      const { role } = response.user;
      setSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully.",
      });
      setTimeout(() => redirectByRole(role), 2000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      toast({
        title: "Reset Password Failed",
        description: err.response?.data?.error || "Unable to reset password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Lock className="h-6 w-6" />
            Reset Password
          </CardTitle>
          <CardDescription>
            {success ? "Password reset successful!" : "Enter your new password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                You will be redirected to your dashboard shortly.
              </p>
              <Button onClick={() => redirectByRole("customer")}>
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) => value === password || "Passwords do not match",
                  })}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}