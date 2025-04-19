"use client"

import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { DeliveryMap } from "@/components/delivery/map";
import { useAuth } from "@/hooks/useAuth";
import { getDeliveryById } from "@/lib/delivery-api";

export default function DeliveryMapPage() {
  const [order, setOrder] = useState(null);
  const { user } = useAuth();
  const deliveryId = user?.id;

  useEffect(() => {
    if (deliveryId) {
      getDeliveryById(deliveryId)
        .then((data) => setOrder(data))
        .catch((err) => console.error("Error loading delivery:", err));
    }
  }, []);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Delivery Map" description="Track your delivery route" />
      {order ? (
        <DeliveryMap order={order} />
      ) : (
        <div className="p-6 text-center bg-muted rounded-lg">Loading...</div>
      )}
    </div>
  );
}
