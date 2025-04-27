"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchUsers } from "@/lib/api/users";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Users, Store, AlertTriangle, CheckCircle, XCircle, ShieldAlert } from "lucide-react";
import { User as BackendUser } from "@/lib/types/user";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "blocked";
  createdAt: string;
}

interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  status?: "active" | "blocked";
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PendingRestaurant {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

interface SystemAdminDashboardProps {
  restaurants: Restaurant[];
  pendingRestaurants: PendingRestaurant[];
}

// Map backend User to dashboard User
const mapBackendUserToDashboardUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  role: backendUser.role,
  status: backendUser.isActive ? "active" : "blocked",
  createdAt: backendUser.createdAt,
});

export function SystemAdminDashboard({ restaurants, pendingRestaurants }: SystemAdminDashboardProps) {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch users on mount
  useEffect(() => {
    const loadUsers = async () => {
      if (!token) {
        setError("Authentication token missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetchUsers(token, {
          page: 1,
          limit: 100, // Fetch up to 100 users to avoid pagination issues
        });
        const mappedUsers = response.data.map(mapBackendUserToDashboardUser);
        setUsers(mappedUsers);
        setError(null);
      } catch (err: any) {
        console.error("Fetch users error:", err);
        setError(err.response?.data?.error || "Failed to fetch users");
        toast({
          title: "Error",
          description: err.response?.data?.error || "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [token]);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;
  const blockedUsers = users.filter((user) => user.status === "blocked").length;

  const totalRestaurants = restaurants.length;
  const activeRestaurants = restaurants.filter((r) => !r.status || r.status === "active").length;
  const blockedRestaurants = restaurants.filter((r) => r.status === "blocked").length;

  const pendingApprovals = pendingRestaurants.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : error ? (
              <p className="text-red-500 text-sm">Error loading users</p>
            ) : (
              <div className="dashboard-stat">
                <div className="dashboard-stat-value">{totalUsers}</div>
                <p className="dashboard-stat-label">
                  {activeUsers} active, {blockedUsers} blocked
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{totalRestaurants}</div>
              <p className="dashboard-stat-label">
                {activeRestaurants} active, {blockedRestaurants} blocked
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{pendingApprovals}</div>
              <p className="dashboard-stat-label">Restaurants awaiting review</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <ShieldAlert className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">Healthy</div>
              <p className="dashboard-stat-label">All systems operational</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Recent User Activity</CardTitle>
            <CardDescription>Latest user registrations and status changes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <p className="text-red-500 text-sm">Error loading user activity</p>
            ) : (
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : user.status === "blocked"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                        }`}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin-system/users">View All Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Pending Restaurant Approvals</CardTitle>
            <CardDescription>Restaurants waiting for your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRestaurants
                .filter((restaurant) => restaurant.status === "pending")
                .slice(0, 5)
                .map((restaurant) => (
                  <div key={restaurant.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">{restaurant.cuisine}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin-system/restaurants">Manage Restaurants</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}