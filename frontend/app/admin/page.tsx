import { AdminDashboard } from "@/components/admin/dashboard"
import { orders } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard-header"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Restaurant Dashboard" description="Manage your restaurant orders and performance" />
      <AdminDashboard orders={orders} />
    </div>
  )
}
