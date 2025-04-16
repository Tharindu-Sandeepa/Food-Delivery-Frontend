import { DeliveryDashboard } from "@/components/delivery/dashboard"
import { orders } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DeliveryPage() {
  // Filter for orders assigned to this delivery person (mock)
  const deliveryPersonId = "1" // Mock delivery person ID
  const assignedOrders = orders.filter(
    (order) => order.deliveryPersonId === deliveryPersonId && ["preparing", "delivering"].includes(order.status),
  )

  return (
    <div className="space-y-6">
      <DashboardHeader title="Delivery Dashboard" description="Manage your active deliveries" />
      <DeliveryDashboard orders={assignedOrders} />
    </div>
  )
}
