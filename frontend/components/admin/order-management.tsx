"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
}

interface OrderManagementProps {
  orders: Order[]
}

export function OrderManagement({ orders: initialOrders }: OrderManagementProps) {
  const [orders, setOrders] = useState(initialOrders)

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const preparingOrders = orders.filter((order) => order.status === "preparing")
  const deliveringOrders = orders.filter((order) => order.status === "delivering")
  const completedOrders = orders.filter((order) => order.status === "completed")

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)))
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "preparing":
        return "bg-blue-500"
      case "delivering":
        return "bg-purple-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatStatus = (status: Order["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <Badge className={getStatusColor(order.status) + " text-white"}>{formatStatus(order.status)}</Badge>
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
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Delivery to: {order.deliveryAddress}</p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Select
              defaultValue={order.status}
              onValueChange={(value) => updateOrderStatus(order.id, value as Order["status"])}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-x-2">
              {order.status === "pending" && (
                <Button onClick={() => updateOrderStatus(order.id, "preparing")}>Accept Order</Button>
              )}
              {order.status === "preparing" && (
                <Button onClick={() => updateOrderStatus(order.id, "delivering")}>Ready for Delivery</Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
          <TabsTrigger value="preparing">Preparing ({preparingOrders.length})</TabsTrigger>
          <TabsTrigger value="delivering">Delivering ({deliveringOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-6">
          {pendingOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">No pending orders</p>
          ) : (
            pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>
        <TabsContent value="preparing" className="mt-6">
          {preparingOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">No orders being prepared</p>
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
        <TabsContent value="completed" className="mt-6">
          {completedOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">No completed orders</p>
          ) : (
            completedOrders.map((order) => <OrderCard key={order.id} order={order} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
