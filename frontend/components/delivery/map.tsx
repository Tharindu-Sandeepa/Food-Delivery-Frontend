"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, CheckCircle } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  items: OrderItem[]
  status: "pending" | "preparing" | "delivering" | "completed" | "cancelled"
  total: number
  createdAt: string
  deliveryAddress: string
  deliveryPersonId?: string
  restaurantAddress?: string
}

interface DeliveryMapProps {
  order: Order
}

export function DeliveryMap({ order }: DeliveryMapProps) {
  const [estimatedTime, setEstimatedTime] = useState(15)
  const [isDelivered, setIsDelivered] = useState(false)

  // Simulate countdown
  useEffect(() => {
    if (estimatedTime > 0 && !isDelivered) {
      const timer = setTimeout(() => {
        setEstimatedTime((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [estimatedTime, isDelivered])

  const handleDelivered = () => {
    setIsDelivered(true)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Delivery Route</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg h-[400px] flex items-center justify-center relative">
              {/* Mock map UI */}
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full animate-ping" />
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full" />

              <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-red-500 rounded-full animate-ping" />
              <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-red-500 rounded-full" />

              <div className="border-2 border-dashed border-primary/50 h-1/2 w-1/2 absolute top-1/4 left-1/4" />

              <div className="text-center text-muted-foreground">
                {isDelivered ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-lg font-medium text-green-500">Delivered!</p>
                  </div>
                ) : (
                  <p>Estimated arrival: {estimatedTime} minutes</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Order #{order.id.slice(0, 8)}</h3>
                <p className="text-sm text-muted-foreground">{order.restaurantName}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Pickup from:</p>
                    <p className="text-sm text-muted-foreground">{order.restaurantAddress || "123 Restaurant St"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Navigation className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Deliver to:</p>
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="font-medium">Items</h3>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                  </div>
                ))}
              </div>

              <Button className="w-full" disabled={isDelivered} onClick={handleDelivered}>
                {isDelivered ? "Delivered" : "Mark as Delivered"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
