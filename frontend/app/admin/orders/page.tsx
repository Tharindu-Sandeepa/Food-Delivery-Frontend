import { OrderManagement } from "@/components/admin/order-management"
import { orders } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard-header"

export default function OrderManagementPage() {
  // Filter for orders belonging to the admin's restaurant (mock)
  const restaurantId = "1" // Mock admin's restaurant ID
  const restaurantOrders = orders.filter((order) => order.restaurantId === restaurantId)

  return (
    <div className="space-y-6">
      <DashboardHeader title="Order Management" description="Track and manage customer orders" />
      <OrderManagement orders={restaurantOrders} />
    </div>
  )
}
