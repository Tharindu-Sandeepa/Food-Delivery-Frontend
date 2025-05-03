"use client"

import { OrderManagement } from "@/components/admin/order-management"
import { DashboardHeader } from "@/components/dashboard-header"
import { useEffect, useState } from "react"
import { getOrderByResturentsId } from "@/lib/order-api"


interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
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
  deliveryAddress: string
  deliveryPersonId?: string
  paymentMethod?: string
}

export default function OrderManagementPage() {
  const [initOrders, setInitOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  //const restaurantId = localStorage.getItem("userId");
  let restaurantId;
  

  useEffect(() => {
    const fetchInitOrders = async () => {
     restaurantId = localStorage.getItem("userId");
      console.log("Restaurant ID",restaurantId)
      if (!restaurantId) return
      
      setLoading(true)
      try {
        const res = await getOrderByResturentsId(restaurantId)
        // Transform the API response to match our Order interface
        const transformedOrders = res.map((order: any) => ({
          _id: order._id,
          orderId: order.orderId,
          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          items: order.items,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress,
          deliveryPersonId: order.deliveryPersonId,
          paymentMethod: order.paymentMethod
        }))
        setInitOrders(transformedOrders)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }
    
    fetchInitOrders()
  }, [restaurantId])

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Order Management" description="Track and manage customer Orders" />
        <div className="flex justify-center items-center h-64">
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Order Management" description="Track and manage customer Orders" />
        <div className="text-red-500 p-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Order Management" description="Track and manage customer Orders" />
      <OrderManagement initOrders={initOrders as any} />
    </div>
  )
}