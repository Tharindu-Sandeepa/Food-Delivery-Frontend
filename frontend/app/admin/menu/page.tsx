import { MenuManagement } from "@/components/admin/menu-management"
import { menuItems } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard-header"

export default function MenuManagementPage() {
  // Filter for items belonging to the admin's restaurant (mock)
  const restaurantId = "1" // Mock admin's restaurant ID
  const restaurantMenu = menuItems.filter((item) => item.restaurantId === restaurantId)

  return (
    <div className="space-y-6">
      <DashboardHeader title="Menu Management" description="Add, edit, and manage your restaurant's menu items" />
      <MenuManagement items={restaurantMenu} />
    </div>
  )
}
