import { DeliveryMap } from "@/components/delivery/map"
import { orders } from "@/lib/mock-data"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DeliveryMapPage() {
  // Get the current delivery (mock)
  const deliveryPersonId = "1" // Mock delivery person ID
  const currentDelivery = orders.find(
    (order) => order.deliveryPersonId === deliveryPersonId && order.status === "delivering",
  )

  return (
    <div className="space-y-6">
      <DashboardHeader title="Delivery Map" description="Track your current delivery route" />
      {currentDelivery ? (
        <DeliveryMap order={currentDelivery} />
      ) : (
        <div className="p-6 text-center bg-muted rounded-lg">
          <p>No active deliveries at the moment.</p>
        </div>
      )}
    </div>
  )
}
