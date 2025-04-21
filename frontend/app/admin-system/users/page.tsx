import { UserManagement } from "@/components/admin-system/user-management";
import { DashboardHeader } from "@/components/dashboard-header";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="User Management"
        description="Manage platform users and their permissions"
      />
      <UserManagement />
    </div>
  );
}