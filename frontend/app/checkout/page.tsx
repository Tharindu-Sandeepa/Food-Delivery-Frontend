"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cartItems } from "@/lib/mock-data"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { CheckoutSummary } from "@/components/checkout/checkout-summary"

export default function CheckoutPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePlaceOrder = () => {
    setIsProcessing(true)

    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      // Redirect to a success page or orders page
      router.push("/orders")
    }, 1500)
  }

  // If cart is empty, redirect to cart page
  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" asChild>
              <a href="/">Browse Restaurants</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your order by providing delivery and payment details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CheckoutForm onPlaceOrder={handlePlaceOrder} isProcessing={isProcessing} />
          </div>
          <div>
            <CheckoutSummary items={cartItems} />
          </div>
        </div>
      </div>
    </main>
  )
}
