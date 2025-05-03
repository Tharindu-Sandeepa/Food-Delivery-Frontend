"use client";

import { useEffect, useState } from "react";
import { DeliveryDashboard } from "@/components/delivery/dashboard";
import { DashboardHeader } from "@/components/dashboard-header";
import { getDeliveriesByUser, getOrderById } from "@/lib/delivery-api";
import { useAuth } from "@/hooks/useAuth";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  deliveryAddress: Address;
  restaurantLocation: Address;
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
  deliveryFee: number;
  subtotal: number;
  createdAt: string;
  paymentMethod: string;
  deliveryId?: string;
  driverId?: string;
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
}

interface Address {
  lat: number;
  lng: number;
  address: string;
}

export interface Delivery {
  deliveryId: string;
  orderId: string;
  driverId: string;
  driverName: string;
  status: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
}

export default function DeliveryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  //  const deliveryPersonId = localStorage.getItem("userId");

  let deliveryPersonId;

  useEffect(() => {
    const fetchData = async () => {
      deliveryPersonId = localStorage.getItem("userId");
      if (!deliveryPersonId) return;

      try {
        setLoading(true);
        setError(null);

        // Get deliveries data (could be array or single object)
        const deliveries = await getDeliveriesByUser(deliveryPersonId);

        // Normalize to array - handle both single object and array cases
        const deliveriesArray = Array.isArray(deliveries)
          ? deliveries
          : deliveries
          ? [deliveries]
          : [];

        if (deliveriesArray.length === 0) {
          setOrders([]);
          return;
        }

        const ordersData = await Promise.all(
          deliveriesArray.map(async (delivery: Delivery) => {
            const order = await getOrderById(delivery.orderId);
            return {
              ...order,
              status: delivery.status,
              deliveryId: delivery.deliveryId,
              driverId: delivery.driverId,
              startLocation: delivery.startLocation,
              endLocation: delivery.endLocation,
            };
          })
        );

        console.log("Fetched orders:", ordersData);

        setOrders(ordersData);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load deliveries"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliveryPersonId]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Delivery Dashboard"
        description="Manage your active deliveries"
        imageUrl="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80"
        imageAvailable={true}
      />

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <DeliveryDashboard orders={orders as any} />
      )}
    </div>
  );
}
