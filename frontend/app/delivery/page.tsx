"use client";

import { useEffect, useState } from "react";
import { DeliveryDashboard } from "@/components/delivery/dashboard";
import { DashboardHeader } from "@/components/dashboard-header";
import { useAuth } from "@/hooks/useAuth";
import { getDeliveriesByUser } from "@/lib/delivery-api";



export default function DeliveryPage() {
  const { user, token } = useAuth();
  const [delivery, setDelivery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [deliveryData, setDeliveryData] = useState<any>([]);
  const deliveryPersonId = user?.id;

  console.log("Delivery Person ID:", delivery);

  useEffect(() => {
    if (deliveryPersonId) {
      getDeliveriesByUser(deliveryPersonId)
        .then((data) => {
          setDelivery(data);
        })
        .catch((err) => {
          console.error("Failed to fetch deliveries:", err);
        });
    }
  }, [deliveryPersonId]);

  



  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Delivery Dashboard"
        description="Manage your active deliveries"
      />
      <DeliveryDashboard orders={orders} />
    </div>
  );
}
