"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { BASE_URL_DELIVERIES, BASE_URL_ORDERS } from "@/lib/constants/Base_url";

const CustomerDeliveryMap = dynamic(
  () =>
    import("@/components/customer/delivery-tracking").then(
      (mod) => mod.CustomerDeliveryMap
    ),
  {
    ssr: false,
    loading: () => <p>Loading map...</p>,
  }
);

export default function TrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: deliveryId } = use(params);

  const [driverId, setDriverId] = useState("");
  const [restaurantLocation, setRestaurantLocation] = useState({
    lat: 0,
    lng: 0,
    address: "",
  });
  const [deliveryAddress, setDeliveryAddress] = useState({
    lat: 0,
    lng: 0,
    address: "",
  });

  const fetchDeliveryDetails = async (deliveryId: string) => {
    const response = await fetch(
      `${BASE_URL_ORDERS}/api/orders/deliveryID/${deliveryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch delivery details");
    }
    const data = await response.json();
    console.log("Delivery details:", data);
    setDriverId(data.deliveryPersonId);
    setRestaurantLocation(data.restaurantLocation);
    setDeliveryAddress(data.deliveryAddress);
  };

  console.log("Delivery ID:", deliveryId);
  console.log("Driver ID:", driverId);
  console.log("Restaurant Location:", restaurantLocation);
  console.log("Delivery Address:", deliveryAddress);

  useEffect(() => {
    fetchDeliveryDetails(deliveryId);
  }, [deliveryId]);

  const customerId = localStorage.getItem("userId") || "";

  return (
    <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Track Your Delivery</h1>
          <p className="text-muted-foreground">
            Follow your order in real-time as it makes its way to you
          </p>
        </div>

        <Suspense fallback={<div>Loading tracking map...</div>}>
          <CustomerDeliveryMap
            deliveryId={deliveryId}
            driverId={driverId}
            restaurantAddress={restaurantLocation}
            deliveryAddress={deliveryAddress}
            customerId={customerId}
          />
        </Suspense>
      </div>
    </main>
  );
}
