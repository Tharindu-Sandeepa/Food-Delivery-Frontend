import { SystemAdminDashboard } from "@/components/admin-system/dashboard"
import { users, restaurants, pendingRestaurants } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard-header"

export default function SystemAdminPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="System Administration"
        description="Manage platform users, restaurants, and system settings"
      />
      <SystemAdminDashboard users={users} restaurants={restaurants} pendingRestaurants={pendingRestaurants} />
    </div>
  )
}
