import { MenuManagement } from "@/components/admin/menu-management"
import { DashboardHeader } from "@/components/dashboard-header"

export default function MenuManagementPage() {
  // Mock admin's restaurant ID - in a real app, this would come from auth/session
  const restaurantId = "67ff56ca667302042dc5f6e0"

  return (
    <div className="space-y-6">
      <DashboardHeader title="Menu Management" description="Add, edit, and manage your restaurant's menu items" />
      <MenuManagement restaurantId={restaurantId} />
    </div>
  )
}