import { OrderList } from "@/components/order-list"
import { orders } from "@/lib/mock-data"

export default function OrdersPage() {
  return (
    <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <OrderList orders={orders} />
      </div>
    </main>
  )
}
