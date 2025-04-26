"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getCurrentUser, updateCurrentUser } from "@/lib/api/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Calendar,
} from "lucide-react";
import { User as UserType } from "@/lib/types/user";

export default function ProfilePage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
  });

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch user data
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setError("Authentication token missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await getCurrentUser(token);
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          address: userData.address || "",
        });
        setError(null);
      } catch (err: any) {
        console.error("Fetch user error:", err);
        setError(err.response?.data?.error || "Failed to fetch user data");
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to fetch user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadUser();
    }
  }, [token, isAuthenticated]);

  // Validate form data
  const validateForm = () => {
    let isValid = true;
    const errors = { name: "", email: "" };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Handle form submission
  const handleUpdateProfile = async () => {
    if (!token || !user) {
      toast({
        title: "Error",
        description: "Invalid user or token",
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const updatedUser = await updateCurrentUser(token, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      setUser(updatedUser);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err: any) {
      console.error("Update profile error:", err);
      toast({
        title: "Error",
        description: err.response?.data?.error || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog
  const openEditDialog = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
      });
      setFormErrors({ name: "", email: "" });
    }
    setIsEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="flex flex-col items-center md:flex-row md:items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-2xl">
              {user?.name ? user.name[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6" />
              {loading ? "Loading..." : user?.name || "User Profile"}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {loading ? "Fetching details..." : user?.email || "No email available"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center">{error}</p>
          ) : user ? (
            <>
              {/* Personal Info Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Name:</span> {user.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Email:</span> {user.email}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Info Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {user.phone || "Not provided"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Address:</span>{" "}
                      {user.address || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Account Info Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Role:</span>{" "}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {user.isActive ? "Active" : "Blocked"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="font-medium">Joined:</span>{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No user data available
            </p>
          )}
        </CardContent>
        <div className="flex justify-between p-6">
          <Button variant="outline" onClick={() => router.push("/")}>
            Back to Dashboard
          </Button>
          {user && (
            <Button onClick={openEditDialog}>
              {/* <Edit className="h-4 w-4 mr-2" /> */}
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
              />
              {formErrors.email && (
                <p className="text-red-500 text-sm">{formErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Enter address"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}