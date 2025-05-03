"use client"

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DeliveryMap } from "@/components/delivery/map";

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
  restaurantId: string;
  orderId: string;
  customerId: string;
  restaurantName: string;
  deliveryAddress: string;
  items: OrderItem[];
  status: "pending" | "assigned" | "delivering" | "completed" | "cancelled";
  total: number;
  createdAt: string;
  paymentMethod: string;
  deliveryId?: string;
  driverId?: string;
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
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

export default function DeliveryMapPage() {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deliveryPersonId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      if (!deliveryPersonId) return;

      try {
        setLoading(true);
        setError(null);

        // Get deliveries data
        const deliveries = await getDeliveriesByUser(deliveryPersonId);
        
        // Filter for delivering status
        const deliveringDeliveries = Array.isArray(deliveries) 
          ? deliveries.filter((d: Delivery) => d.status === "delivering")
          : deliveries && deliveries.status === "delivering"
          ? [deliveries]
          : [];

        if (deliveringDeliveries.length === 0) {
          setOrder(null);
          return;
        }

        // Get the first delivering order (assuming only one active delivery at a time)
        const activeDelivery = deliveringDeliveries[0];
        const orderData = await getOrderById(activeDelivery.orderId);

        setOrder({
          ...orderData,
          status: activeDelivery.status,
          deliveryId: activeDelivery.deliveryId,
          driverId: activeDelivery.driverId,
          startLocation: activeDelivery.startLocation,
          endLocation: activeDelivery.endLocation,
        });

      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
        setError(err instanceof Error ? err.message : "Failed to load deliveries");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deliveryPersonId]);

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader title="Delivery Map" description="Track your delivery route" />
        <div className="p-6 text-center text-red-500 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Delivery Map" description="Track your delivery route" />
      {loading ? (
        <div className="p-6 text-center bg-muted rounded-lg">Loading...</div>
      ) : order ? (
        <DeliveryMap order={order as any} />
      ) : (
        <div className="p-6 text-center bg-muted rounded-lg">
          No active deliveries to track
        </div>
      )}
    </div>
  );
}