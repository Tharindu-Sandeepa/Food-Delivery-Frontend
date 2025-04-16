"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MapPin, Navigation, CheckCircle, Phone } from "lucide-react"

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
  deliveryPerson?: {
    name: string
    phone: string
    image?: string
  }
}

interface DeliveryTrackingProps {
  order: Order
}

export function DeliveryTracking({ order }: DeliveryTrackingProps) {
  const [estimatedTime, setEstimatedTime] = useState(15)
  const [deliveryProgress, setDeliveryProgress] = useState(30) // percentage of delivery completed

  // Simulate countdown and progress
  useEffect(() => {
    if (estimatedTime > 0 && order.status === "delivering") {
      const timer = setTimeout(() => {
        setEstimatedTime((prev) => prev - 1)
        setDeliveryProgress((prev) => Math.min(prev + 1, 100))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [estimatedTime, order.status])

  // Mock delivery person data if not provided
  const deliveryPerson = order.deliveryPerson || {
    name: "John Delivery",
    phone: "+1 (555) 123-4567",
    image: "/placeholder.svg?height=100&width=100",
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Delivery Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg h-[400px] flex items-center justify-center relative">
              {/* Mock map UI */}
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full animate-ping" />
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary rounded-full" />

              <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-red-500 rounded-full animate-ping" />
              <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-red-500 rounded-full" />

              <div className="border-2 border-dashed border-primary/50 h-1/2 w-1/2 absolute top-1/4 left-1/4" />

              {/* Delivery vehicle icon that moves along the path */}
              <div
                className="absolute w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white"
                style={{
                  left: `calc(25% + ${deliveryProgress * 0.5}%)`,
                  top: `calc(25% + ${deliveryProgress * 0.5}%)`,
                }}
              >
                <Navigation className="h-4 w-4" />
              </div>

              <div className="text-center text-muted-foreground">
                {order.status === "completed" ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="text-lg font-medium text-green-500">Delivered!</p>
                  </div>
                ) : (
                  <p>Estimated arrival: {estimatedTime} minutes</p>
                )}
              </div>
            </div>

            {/* Delivery progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Order picked up</span>
                <span>On the way</span>
                <span>At your door</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${deliveryProgress}%` }}></div>
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

              {/* Delivery person info */}
              <div>
                <h3 className="font-medium mb-2">Your Delivery Person</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {deliveryPerson.image ? (
                      <img
                        src={deliveryPerson.image || "/placeholder.svg"}
                        alt={deliveryPerson.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Navigation className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{deliveryPerson.name}</p>
                    <p className="text-sm text-muted-foreground">{deliveryPerson.phone}</p>
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Contact Driver
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
