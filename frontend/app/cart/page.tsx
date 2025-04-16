import { CartList } from "@/components/cart-list"
import { CartSummary } from "@/components/cart-summary"
import { cartItems } from "@/lib/mock-data"

export default function CartPage() {
  return (
    <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CartList items={cartItems} />
          </div>
          <div>
            <CartSummary items={cartItems} />
          </div>
        </div>
      </div>
    </main>
  )
}
