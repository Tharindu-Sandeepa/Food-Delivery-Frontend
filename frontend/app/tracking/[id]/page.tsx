"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CustomerDeliveryMap = dynamic(() => import("@/components/customer/delivery-tracking").then(mod => mod.CustomerDeliveryMap), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: deliveryId } = use(params);
  const driverId = "6807323213c5beffbfde777f";
  const restaurantAddress = {
    lat: 6.9061,
    lng: 79.9696,
    address: "No 56, New Kandy Road, Malabe",
  };
  const deliveryAddress = {
    lat: 6.898,
    lng: 79.9223,
    address: "456 Elm St, New York, NY",
  };
  const customerId = "6808d9e1fcb926c46613fb00";

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
            restaurantAddress={restaurantAddress}
            deliveryAddress={deliveryAddress}
            customerId={customerId}
          />
        </Suspense>
      </div>
    </main>
  );
}
