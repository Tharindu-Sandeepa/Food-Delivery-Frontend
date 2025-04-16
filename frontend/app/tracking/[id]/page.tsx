import { DeliveryTracking } from "@/components/customer/delivery-tracking"
import { orders } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export default function TrackingPage({ params }: { params: { id: string } }) {
  // Find the order with the given ID
  const order = orders.find((order) => order.id === params.id)

  // If order not found or not in delivering status, show 404
  if (!order || order.status !== "delivering") {
    return notFound()
  }

  // Add mock restaurant address and delivery person info
  const orderWithDetails = {
    ...order,
    restaurantAddress: "123 Restaurant St, Food City, FC 12345",
    deliveryPerson: {
      name: "John Delivery",
      phone: "+1 (555) 123-4567",
      image: "/placeholder.svg?height=100&width=100",
    },
  }

  return (
    <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Track Your Delivery</h1>
          <p className="text-muted-foreground">Follow your order in real-time as it makes its way to you</p>
        </div>

        <DeliveryTracking order={orderWithDetails} />
      </div>
    </main>
  )
}
