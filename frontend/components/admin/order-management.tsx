"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AssignDriverDialog } from "../delivery/assignDriverDialog"
import { useToast } from "@/components/ui/use-toast"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Address {
  lat: number
  lng: number
  address: string
}

interface Order {
  _id: string
  orderId: string
  restaurantId: string
  restaurantName: string
  items: OrderItem[]
  status: "pending" | "preparing" | "ready" | "assigned" | "delivering" | "completed" | "cancelled"
  total: number
  createdAt: string
  deliveryAddress: Address
  restaurantLocation: Address
  deliveryPersonId?: string
  deliveryPersonName?: string
  paymentMethod?: string
}

interface OrderManagementProps {
  initOrders: Order[]
}

export function OrderManagement({ initOrders }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>(initOrders)
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const preparingOrders = orders.filter((order) => order.status === "preparing")
  const readyOrders = orders.filter((order) => order.status === "ready")
  const assignedOrders = orders.filter((order) => order.status === "assigned")
  const deliveringOrders = orders.filter((order) => order.status === "delivering")
  const completedOrders = orders.filter((order) => order.status === "completed")

  const handleMarkReady = async (order: Order) => {

    setAssigningOrder(order)
    // try {
    //   const response = await fetch(`http://localhost:3001/api/orders/${order.orderId}/ready`, {
    //     method: 'PATCH'
    //   })
    //   if (response.ok) {
    //     setOrders(prev => prev.map(o => 
    //       o.orderId === order.orderId ? { ...o, status: 'assigned' } : o
    //     ))
    //     //setAssigningOrder(order)

    //     window.location.reload()
        
        
    //     toast({
    //       title: "Order marked as ready",
    //       description: "Driver assign",
    //     })
    //   } else {
    //     throw new Error(await response.text())
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Failed to mark order as ready",
    //     description: error instanceof Error ? error.message : "Unknown error",
    //     variant: "destructive"
    //   })
    // }
  }

  const handleAssignmentComplete = (driver: { driverId: string; driverName: string }) => {
    if (!assigningOrder) return

    setOrders(prev => prev.map(o => 
      o.orderId === assigningOrder.orderId ? {
        ...o,
        status: 'assigned',
        deliveryPersonId: driver.driverId,
        deliveryPersonName: driver.driverName
      } : o
    ))
    setAssigningOrder(null)
    toast({
      title: "Driver assigned",
      description: `${driver.driverName} is on the way to pick up the order`,
    })
  }

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setOrders(prev => prev.map(order => 
          order.orderId === orderId ? { ...order, status } : order
        ))
      } else {
        throw new Error(await response.text())
      }
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-500"
      case "preparing": return "bg-blue-500"
      case "ready": return "bg-orange-500"
      case "assigned": return "bg-indigo-500"
      case "delivering": return "bg-purple-500"
      case "completed": return "bg-green-500"
      case "cancelled": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const formatStatus = (status: Order["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.orderId} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order #{order.orderId.slice(0, 8)}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge className={`${getStatusColor(order.status)} text-white`}>
            {formatStatus(order.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
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
            <p>Delivery to: {order.deliveryAddress?.address}</p>
            {order.deliveryPersonId && (
              <p>Driver: {order.deliveryPersonName || `#${order.deliveryPersonId.slice(0, 6)}`}</p>
            )}
            {order.paymentMethod && (
              <p>Payment: {order.paymentMethod}</p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Select
              value={order.status}
              onValueChange={(value) => updateOrderStatus(order.orderId, value as Order["status"])}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-x-2">
              {order.status === "pending" && (
                <Button onClick={() => updateOrderStatus(order.orderId, "preparing")}>Accept Order</Button>
              )}
              {order.status === "preparing" && (
                <Button onClick={() => handleMarkReady(order)}>Mark as Ready</Button>
              )}
              {/* {order.status === "assigned" && (
                <Button onClick={() => updateOrderStatus(order.orderId, "delivering")}>Start Delivery</Button>
              )} */}
              {order.status === "delivering" && (
                <Button onClick={() => updateOrderStatus(order.orderId, "completed")}>Complete Delivery</Button>
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
          <TabsTrigger value="ready">Ready ({readyOrders.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assignedOrders.length})</TabsTrigger>
          <TabsTrigger value="delivering">Delivering ({deliveringOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingOrders.length === 0 ? <p className="text-center text-muted-foreground">No pending orders</p> : pendingOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
        </TabsContent>
        <TabsContent value="preparing" className="mt-6">
          {preparingOrders.length === 0 ? <p className="text-center text-muted-foreground">No orders being prepared</p> : preparingOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
        </TabsContent>
        <TabsContent value="ready" className="mt-6">
          {readyOrders.length === 0 ? <p className="text-center text-muted-foreground">No orders ready for delivery</p> : readyOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
        </TabsContent>
        <TabsContent value="assigned" className="mt-6">
          {assignedOrders.length === 0 ? <p className="text-center text-muted-foreground">No orders assigned to drivers</p> : assignedOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
        </TabsContent>
        <TabsContent value="delivering" className="mt-6">
          {deliveringOrders.length === 0 ? <p className="text-center text-muted-foreground">No orders being delivered</p> : deliveringOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          {completedOrders.length === 0 ? <p className="text-center text-muted-foreground">No completed orders</p> : completedOrders.map(order => <OrderCard key={order.orderId} order={order} />)}
        </TabsContent>
      </Tabs>
* 
      <AssignDriverDialog
        orderId={assigningOrder?.orderId || ''}
        open={!!assigningOrder}
        onClose={() => setAssigningOrder(null)}
        onAssignmentComplete={handleAssignmentComplete}
        deliveryAddress={assigningOrder?.deliveryAddress}
        startLocation={assigningOrder?.restaurantLocation}
        restaurantId={assigningOrder?.restaurantId}
      />
     
    </div>
  )
}