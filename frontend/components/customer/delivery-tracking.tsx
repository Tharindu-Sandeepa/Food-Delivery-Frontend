"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import io from "socket.io-client";
import "leaflet/dist/leaflet.css";
import { BASE_URL_DELIVERIES } from "@/lib/constants/Base_url";
import { useRouter } from "next/navigation";

const icon = L.icon({
  iconUrl: "/images/delivery-bike.png",
  iconSize: [80, 80],
  iconAnchor: [40, 80],
  popupAnchor: [0, -80],
});

interface CustomerDeliveryMapProps {
  deliveryId: string;
  driverId: string;
  restaurantAddress: { lat: number; lng: number; address: string };
  deliveryAddress: { lat: number; lng: number; address: string };
  customerId: string;
}

export function CustomerDeliveryMap({
  deliveryId,
  driverId,
  restaurantAddress,
  deliveryAddress,
  customerId,
}: CustomerDeliveryMapProps) {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [prevPos, setPrevPos] = useState<[number, number] | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const router = useRouter();

  useEffect(() => {
    // Fix for default icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/delivery-bike.png",
      iconUrl: "/images/delivery-bike.png",
      shadowUrl: "/images/marker-shadow.png",
    });

    const newSocket = io(`${BASE_URL_DELIVERIES}`, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      query: {
        customerId,
        deliveryId,
      },
    });
    setSocket(newSocket);

    const fetchRoute = async () => {
      try {
        const response = await fetch(
          `${BASE_URL_DELIVERIES}/api/deliveries/${deliveryId}/route`
        );
        const data = await response.json();
        setRoute(data.route);
      } catch (err) {
        setRoute([
          [restaurantAddress.lat, restaurantAddress.lng],
          [deliveryAddress.lat, deliveryAddress.lng],
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();

    return () => {
      newSocket.disconnect();
    };
  }, [deliveryId, customerId]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setConnectionStatus("connected");
      socket.emit("customer_subscribe", {
        customerId,
        deliveryId,
      });
    };

    const onDisconnect = () => {
      setConnectionStatus("disconnected");
    };

    const positionHandler = (data: {
      position: { lat: number; lng: number };
      progress: number;
    }) => {
      const newPos: [number, number] = [data.position.lat, data.position.lng];
      setPrevPos(driverPos || newPos);
      setDriverPos(newPos);
      setProgress(data.progress);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("position_update", positionHandler);

    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping");
      }
    }, 25000);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("position_update", positionHandler);
      clearInterval(pingInterval);
    };
  }, [socket, deliveryId, driverPos]);

  // Watch for delivery completion (progress >= 98%)
  useEffect(() => {
    if (progress >= 98) {
      // Delay slightly to ensure delivery completion animation shows
      const timer = setTimeout(() => {
        router.push(`/feedback/${deliveryId}`);
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [progress, deliveryId, router]);

  if (loading) {
    return <div className="p-4 text-center">Loading delivery tracking...</div>;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="font-medium">Delivery Progress: {progress}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">From:</p>
              <p className="text-sm">{restaurantAddress.address}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">To:</p>
              <p className="text-sm">{deliveryAddress.address}</p>
            </div>
          </div>
        </div>

        <MapContainer
          center={driverPos || [restaurantAddress.lat, restaurantAddress.lng]}
          zoom={15}
          scrollWheelZoom
          style={{
            height: "400px",
            width: "100%",
            borderRadius: "0.5rem",
            position: "relative",
          }}
        >
          {!driverPos && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 z-[1000]">
              <p>Loading delivery position...</p>
            </div>
          )}

          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {route?.length > 1 && (
            <Polyline
              positions={route}
              color="#3b82f6"
              weight={5}
              opacity={0.7}
            />
          )}

          {driverPos && (
            <LeafletTrackingMarker
              icon={icon}
              position={driverPos}
              previousPosition={prevPos || driverPos}
              duration={1000}
            />
          )}

          <Marker
            position={[restaurantAddress.lat, restaurantAddress.lng]}
            icon={L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            })}
          >
            <Popup>
              <div className="font-semibold">Restaurant</div>
              <div className="text-sm">{restaurantAddress.address}</div>
            </Popup>
          </Marker>

          <Marker
            position={[deliveryAddress.lat, deliveryAddress.lng]}
            icon={L.icon({
              iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
              iconSize: [40, 40],
              iconAnchor: [20, 40],
              popupAnchor: [0, -40],
            })}
          >
            <Popup>
              <div className="font-semibold">Delivery Address</div>
              <div className="text-sm">{deliveryAddress.address}</div>
            </Popup>
          </Marker>
        </MapContainer>
      </CardContent>
    </Card>
  );
}
