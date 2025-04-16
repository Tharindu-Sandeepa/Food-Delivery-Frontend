import { RestaurantManagement } from "@/components/admin-system/restaurant-management"
import { restaurants, pendingRestaurants } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard-header"

export default function RestaurantManagementPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Restaurant Management" description="Approve, reject, and manage platform restaurants" />
      <RestaurantManagement restaurants={restaurants} pendingRestaurants={pendingRestaurants} />
    </div>
  )
}
