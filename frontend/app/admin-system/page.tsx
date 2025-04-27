"use client";

import { SystemAdminDashboard } from "@/components/admin-system/dashboard";
import { users, restaurants, pendingRestaurants } from "@/lib/mock-data";
import { DashboardHeader } from "@/components/dashboard-header";
import { useProtect } from "@/hooks/useProtect";

export default function SystemAdminPage() {
  useProtect();

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="System Administration"
        description="Manage platform users, restaurants, and system settings"
      />
      <SystemAdminDashboard
        users={users as any}
        restaurants={restaurants as any}
        pendingRestaurants={pendingRestaurants as any}
      />
    </div>
  );
}
