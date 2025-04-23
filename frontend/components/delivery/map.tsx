"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import { updateOrderStatus2 } from "@/lib/delivery-api";
import io from "socket.io-client";

const icon = L.icon({
  iconUrl: "/images/delivery-bike.png",
  iconSize: [80, 80],
  iconAnchor: [40, 80],
  popupAnchor: [0, -80],
  className: "moving-bike-icon",
});

interface DeliveryMapProps {
  order: {
    id: string;
    deliveryId: string;
    driverId: string;
    restaurantName: string;
    restaurantAddress?: Address;
    deliveryAddress: Address;
    status: string;
    items: any[];
    startLocation?: { lat: number; lng: number };
    endLocation?: { lat: number; lng: number };
  };
}

interface Address {
  lat: number;
  lng: number;
  address: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export function DeliveryMap({ order }: DeliveryMapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [prev, setPrev] = useState<[number, number]>([0, 0]);
  const [index, setIndex] = useState(0);
  const [delivered, setDelivered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [socket, setSocket] = useState<any | null>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Debugging
  useEffect(() => {
    console.log("Current position:", pos);
    console.log("Current progress:", Math.round((index / route.length) * 100));
  }, [pos, index, route]);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        setLoading(true);
        setError(null);

        const start = order.startLocation || { lat: 6.9271, lng: 79.8612 };
        const end = order.endLocation || { lat: 6.9281, lng: 79.8622 };

        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.NEXT_PUBLIC_ORS_API_KEY}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
        );

        if (!response.ok) throw new Error("Failed to fetch route");

        const data = await response.json();
        const coordinates = data.features[0].geometry.coordinates;
        const points = coordinates.map((coord: [number, number]) => [
          coord[1],
          coord[0],
        ]) as [number, number][];

        setRoute(points);
        setPos(points[0]);
        setPrev(points[0]);
      } catch (err) {
        console.error("Route fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load route");
        const start = order.startLocation || { lat: 6.9271, lng: 79.8612 };
        const end = order.endLocation || { lat: 6.9281, lng: 79.8622 };
        setRoute(generateMockRoute(start, end, 50));
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [order]);

  // Socket.IO connection
  useEffect(() => {
    if (!isStarted) return;

    const newSocket = io("http://localhost:3003", {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      query: {
        driverId: order.driverId,
        deliveryId: order.deliveryId,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      newSocket.emit("driver_register", {
        driverId: order.driverId,
        position: { lat: pos[0], lng: pos[1] },
      });
    });

    newSocket.on("connect_error", (err: any) => {
      console.error("Connection error:", err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isStarted, order.driverId, order.deliveryId]);

  // Position animation and updates
  useEffect(() => {
    if (route.length === 0 || !isStarted) return;

    animationRef.current = setInterval(() => {
      if (index < route.length - 1) {
        const next = route[index + 1];
        setPrev(pos);
        setPos(next);
        setIndex((i) => i + 1);

        // Send position update
        if (socket?.connected) {
          socket.emit("position_update", {
            driverId: order.driverId,
            deliveryId: order.deliveryId,
            position: { lat: next[0], lng: next[1] },
            progress: Math.round(((index + 1) / route.length) * 100),
          });
          console.log("Sent position update");
        }
      } else {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      }
    }, 300);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [index, pos, route, isStarted, socket, order.driverId, order.deliveryId]);

  const startDelivery = () => {
    setIsStarted(true);
    setIndex(0);
    if (route.length > 0) {
      setPos(route[0]);
      setPrev(route[0]);
    }
  };

  const handleDeliveryUpdate = async () => {
    const status = "completed";
    updateOrderStatus2(
      order.deliveryId,
      status,
      order.endLocation || { lat: 0, lng: 0 },
      order.driverId
    ).then(() => {
      setDelivered(true);
    });
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>Error: {error}</p>
        <p>Using simulated route instead</p>
      </div>
    );
  }

  if (loading || route.length === 0) {
    return <div className="p-4 text-center">Loading route...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Delivery Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <MapContainer
              center={pos}
              zoom={17}
              scrollWheelZoom
              style={{ height: "400px", width: "100%" }}
            >
              <MapUpdater center={pos} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Polyline
                positions={route}
                color="blue"
                weight={5}
                opacity={0.7}
              />
              <LeafletTrackingMarker
                icon={icon}
                position={pos}
                previousPosition={prev}
                duration={300}
                keepAtCenter={false}
              />
            </MapContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Restaurant: {order.restaurantName}</p>
            <p className="text-sm">
              Pickup: {order.restaurantAddress?.address || "Not specified"}
            </p>
            <p className="text-sm">Drop: {order.deliveryAddress.address}</p>

            {!isStarted ? (
              <div className="pt-4">
                <Button
                  onClick={startDelivery}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Start Delivery
                </Button>
              </div>
            ) : (
              <>
                <div className="pt-4">
                  <Button
                    onClick={handleDeliveryUpdate}
                    disabled={delivered}
                    className="w-full"
                  >
                    {delivered ? "Delivered ✅" : "Mark as Delivered"}
                  </Button>
                </div>
                {index < route.length - 1 && (
                  <div className="pt-2 text-sm text-muted-foreground">
                    Delivery in progress (
                    {Math.round((index / route.length) * 100)}%)
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateMockRoute(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  steps = 50
): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const lat = start.lat + (end.lat - start.lat) * (i / steps);
    const lng = start.lng + (end.lng - start.lng) * (i / steps);
    points.push([lat, lng]);
  }
  return points;
}
