"use client";

import { useEffect, useState } from "react";
import { AdminDashboard } from "@/components/admin/dashboard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useProtect } from "@/hooks/useProtect";
import { getOrderByResturentsId } from "@/lib/order-api";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Address {
  lat: number;
  lng: number;
  address: string;
}

interface Order {
  _id: string;
  orderId: string; // Ensure orderId is required
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  status:
    | "pending"
    | "preparing"
    | "ready"
    | "assigned"
    | "delivering"
    | "completed"
    | "cancelled";
  total: number;
  createdAt: string;
  deliveryAddress: Address;
  restaurantLocation: Address;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  paymentMethod?: string;
  contactNumber?: string;
}

export default function AdminPage() {
  useProtect();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //const restaurantId = localStorage.getItem("userId");
  let restaurantId;

  useEffect(() => {
    const fetchOrders = async () => {
      restaurantId = localStorage.getItem("userId");
      if (!restaurantId) {
        setError("Restaurant ID not found");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await getOrderByResturentsId(restaurantId);
        // Transform API response to match Order interface
        const transformedOrders = res.map((order: any) => ({
          _id: order._id || "unknown_" + Math.random().toString(36).substr(2, 9), // Fallback for _id
          orderId: order.orderId || "unknown_" + Math.random().toString(36).substr(2, 8), // Fallback for orderId
          restaurantId: order.restaurantId || "unknown",
          restaurantName: order.restaurantName || "Unknown Restaurant",
          items: order.items || [],
          status: order.status || "pending",
          total: order.total || 0,
          createdAt: order.createdAt || new Date().toISOString(),
          deliveryAddress: order.deliveryAddress || {
            address: "Unknown",
            lat: 0,
            lng: 0,
          },
          restaurantLocation: order.restaurantLocation || {
            address: order.restaurantName || "Unknown",
            lat: 0,
            lng: 0,
          },
          deliveryPersonId: order.deliveryPersonId,
          deliveryPersonName: order.deliveryPersonName,
          paymentMethod: order.paymentMethod || "Unknown",
          contactNumber: order.contactNumber || "N/A",
        }));
        setOrders(transformedOrders);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Restaurant Dashboard"
          description="Manage your restaurant orders and performance"
        />
        <div className="flex justify-center items-center h-64">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          title="Restaurant Dashboard"
          description="Manage your restaurant orders and performance"
        />
        <div className="text-red-500 p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Restaurant Dashboard"
        description="Manage your restaurant orders and performance"
      />
      <AdminDashboard orders={orders} />
    </div>
  );
}