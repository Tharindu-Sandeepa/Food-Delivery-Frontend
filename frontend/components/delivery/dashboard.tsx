"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Navigation } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  deliveryAddress: string;
  items: OrderItem[];
  status: "pending" | "assigned" | "delivering" | "completed" | "cancelled" | "preparing" | "delivered";
  total: number;
  createdAt: string;
  paymentMethod: string; // Added paymentMethod property
  deliveryId?: string;
  driverId?: string;
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
}

interface DeliveryDashboardProps {
  orders: Order[]
}

export function DeliveryDashboard({ orders: initialOrders }: DeliveryDashboardProps) {
  const [orders, setOrders] = useState(initialOrders)

  console.log("Orders:", orders)

  const preparingOrders = orders.filter((order) => order.status === "assigned")
  const deliveringOrders = orders.filter((order) => order.status === "delivering")
  const deliveredOrders = orders.filter((order) => order.status === "delivered")

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {order.restaurantName} • {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge className={order.status === "preparing" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"}>
            {order.status === "preparing" ? "Ready for Pickup" : "Delivering"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Pickup from:</p>
                <p className="text-sm text-muted-foreground">{order.startLocation?.lat}</p>
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

          <div className="flex justify-between items-center pt-2">
            {order.status === "preparing" ? (
              <Button onClick={() => updateOrderStatus(order.id, "delivering")}>Picked Up</Button>
            ) : (
              <Button onClick={() => updateOrderStatus(order.id, "completed")}>Delivered</Button>
            )}

            {order.status === "delivering" && (
              <Button variant="outline" asChild>
                <Link href="/delivery/map">View Map</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="delivering">
        <TabsList>
          <TabsTrigger value="pickup">Ready for Pickup ({preparingOrders.length})</TabsTrigger>
          <TabsTrigger value="delivering">Delivering ({deliveringOrders.length})</TabsTrigger>
          <TabsTrigger value="delivered">Completed ({deliveredOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pickup" className="mt-6">
          {preparingOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">No orders ready for pickup</p>
          ) : (
            preparingOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>
        <TabsContent value="delivering" className="mt-6">
          {deliveringOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">No orders being delivered</p>
          ) : (
            deliveringOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>
        <TabsContent value="delivered" className="mt-6">
          {deliveringOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">No orders being completed</p>
          ) : (
            deliveredOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
