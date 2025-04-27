"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import  io from "socket.io-client";
import "leaflet/dist/leaflet.css";
import { BASE_URL_DELIVERIES } from "@/lib/constants/Base_url";



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
  const [driverPos, setDriverPos] = useState<[number, number]>([
    restaurantAddress.lat,
    restaurantAddress.lng,
  ]);
  const [prevPos, setPrevPos] = useState<[number, number]>([
    restaurantAddress.lat,
    restaurantAddress.lng,
  ]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<any | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev.slice(-10), message]); // Keep last 10 messages
  };

  useEffect(() => {
    addDebugLog(`[INIT] Creating socket connection`);
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
        // addDebugLog(`[ROUTE] Fetching route for delivery ${deliveryId}`);
        const response = await fetch(
          `${BASE_URL_DELIVERIES}/api/deliveries/${deliveryId}/route`
        );
        const data = await response.json();
        setRoute(data.route);
        addDebugLog(`[ROUTE] Received route with ${data.route.length} points`);
      } catch (err) {
        addDebugLog(
          `[ERROR] Failed to fetch route: ${
            typeof err === "object" && err !== null && "message" in err
              ? (err as { message?: string }).message
              : String(err)
          }`
        );
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
      // addDebugLog(`[CLEANUP] Disconnecting socket`);
      newSocket.disconnect();
    };
  }, [deliveryId, customerId]);

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setConnectionStatus("connected");
      // addDebugLog(`[SOCKET] Connected with ID: ${socket.id}`);
      socket.emit("customer_subscribe", {
        customerId,
        deliveryId,
      });
      // addDebugLog(`[SUBSCRIBE] Sent subscription for delivery ${deliveryId}`);
    };

    const onDisconnect = () => {
      setConnectionStatus("disconnected");
      // addDebugLog(`[SOCKET] Disconnected`);
    };

    const onConnectError = (err: any) => {
      addDebugLog(`[SOCKET] Connection error: ${err.message}`);
    };

    const positionHandler = (data: {
      position: { lat: number; lng: number };
      progress: number;
    }) => {
      // addDebugLog(`[UPDATE] Received position update`);
      // addDebugLog(`Position: ${JSON.stringify(data.position)}`);
      // addDebugLog(`Progress: ${data.progress}%`);
      
      const newPos: [number, number] = [data.position.lat, data.position.lng];
      setPrevPos(driverPos);
      setDriverPos(newPos);
      setProgress(data.progress);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("position_update", positionHandler);

    // Ping every 25 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("ping", () => {
          addDebugLog(`[PING] Server responded`);
        });
      }
    }, 25000);

    return () => {
      // addDebugLog(`[CLEANUP] Removing socket listeners`);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("position_update", positionHandler);
      clearInterval(pingInterval);
    };
  }, [socket, deliveryId, driverPos]);

  if (loading) {
    return <div className="p-4 text-center">Loading delivery tracking...</div>;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Your Delivery</CardTitle>
        {/* <div className="text-sm">
          Status: {connectionStatus === "connected" ? (
            <span className="text-green-500">Connected</span>
          ) : (
            <span className="text-red-500">Disconnected</span>
          )}
        </div> */}
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
          center={driverPos}
          zoom={15}
          scrollWheelZoom
          style={{ height: "400px", width: "100%", borderRadius: "0.5rem" }}
        >
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

          <LeafletTrackingMarker
            icon={icon}
            position={driverPos}
            previousPosition={prevPos}
            duration={1000}
          />
          <Marker position={[restaurantAddress.lat, restaurantAddress.lng]}>
            <Popup>
              <div className="font-semibold">Restaurant</div>
              <div className="text-sm">{restaurantAddress.address}</div>
            </Popup>
          </Marker>
          <Marker position={[deliveryAddress.lat, deliveryAddress.lng]}>
            <Popup>
              <div className="font-semibold">Delivery Address</div>
              <div className="text-sm">{deliveryAddress.address}</div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Debug panel - can be hidden in production */}
        {/* <div className="mt-4 p-2 bg-gray-100 rounded text-xs max-h-40 overflow-y-auto">
          <div className="font-semibold mb-1">Debug Log:</div>
          {debugLog.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div> */}
      </CardContent>
    </Card>
  );
}