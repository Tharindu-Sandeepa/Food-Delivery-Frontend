"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Navigation, CreditCard, Clock } from "lucide-react";
import { updateOrderStatus } from "@/lib/delivery-api";
import { useRouter } from "next/navigation";
import { Delivery } from "../../app/delivery/page";

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
  createdAt: string;
  paymentMethod: string;
  deliveryId?: string;
  deliveryFee: number;
  subtotal: number;
  driverId?: string;
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
}

interface Address {
  lat: number;
  lng: number;
  address: string;
}

interface DeliveryDashboardProps {
  orders: Order[];
}

export function DeliveryDashboard({
  orders: initialOrders,
}: DeliveryDashboardProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const router = useRouter();

  const pendingOrders = orders.filter((order) => order.status === "pending");
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing"
  );
  const assignedOrders = orders.filter((order) => order.status === "assigned");
  const deliveringOrders = orders.filter(
    (order) => order.status === "delivering"
  );
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );

  const upOrderStatus = (deliveryId: string, status: Order["status"]) => {
    // Make API call to update order status
    updateOrderStatus(deliveryId, status)
      .then(() => {
        setOrders((prev) =>
          prev.map((order) =>
            order.deliveryId === deliveryId ? { ...order, status } : order
          )
        );
      })
      .then(() => {
        router.push("/delivery/map");
      });
  };

  const getBadgeVariant = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return { class: "bg-gray-500 text-white", text: "Pending" };
      case "preparing":
        return { class: "bg-yellow-500 text-white", text: "Preparing" };
      case "assigned":
        return { class: "bg-blue-500 text-white", text: "Ready for Pickup" };
      case "delivering":
        return { class: "bg-purple-500 text-white", text: "Delivering" };
      case "completed":
        return { class: "bg-green-500 text-white", text: "Completed" };
      case "cancelled":
        return { class: "bg-red-500 text-white", text: "Cancelled" };
      default:
        return { class: "bg-gray-500 text-white", text: status };
    }
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const badge = getBadgeVariant(order.status);

    return (
      <Card key={order.id || order.orderId} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                Order #{order.orderId?.slice(0, 8) || order.id?.slice(0, 8)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {order.restaurantName} •{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge className={badge.class}>{badge.text}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sub Toatal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Payment Method:</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {order.paymentMethod?.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Pickup from:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.restaurantName} {" ,"}
                    {order.restaurantLocation.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Navigation className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Deliver to:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {order.status === "assigned" && deliveringOrders.length == 0 ? (
                <Button
                  onClick={() =>
                    order.deliveryId &&
                    upOrderStatus(order.deliveryId, "delivering")
                  }
                >
                  Picked Up
                </Button>
              ) : order.status === "delivering" ? (
                <Button
                  onClick={() =>
                    order.deliveryId &&
                    upOrderStatus(order.deliveryId, "completed")
                  }
                >
                  Delivered
                </Button>
              ) : null}

              {order.status === "delivering" && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/delivery/map?orderId=${order.id || order.orderId}`}
                  >
                    View Map
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-full">
      <Tabs defaultValue="assigned">
        <TabsList className="grid grid-cols-4">
          {/* <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger> */}
          {/* <TabsTrigger value="preparing">
            Preparing ({preparingOrders.length})
          </TabsTrigger> */}
          <TabsTrigger value="assigned">
            Ready ({assignedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="delivering">
            Delivering ({deliveringOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        {/* <TabsContent value="pending" className="mt-6">
          {pendingOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">No pending orders</p>
          ) : (
            pendingOrders.map((order) => <OrderCard key={order.id || order.orderId} order={order} />)
          )}
        </TabsContent> */}

        {/* <TabsContent value="preparing" className="mt-6">
          {preparingOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No orders being prepared
            </p>
          ) : (
            preparingOrders.map((order) => (
              <OrderCard key={order.id || order.orderId} order={order} />
            ))
          )}
        </TabsContent> */}

        <TabsContent value="assigned" className="mt-6">
          {assignedOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No orders ready for pickup
            </p>
          ) : (
            assignedOrders.map((order) => (
              <OrderCard key={order.id || order.orderId} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="delivering" className="mt-6">
          {deliveringOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No orders being delivered
            </p>
          ) : (
            deliveringOrders.map((order) => (
              <OrderCard key={order.id || order.orderId} order={order} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedOrders.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No completed orders
            </p>
          ) : (
            completedOrders.map((order) => (
              <OrderCard key={order.id || order.orderId} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Completed Orders</h3>
        {completedOrders.length === 0 ? (
          <p className="text-center text-muted-foreground">No completed orders</p>
        ) : (
          completedOrders.map((order) => <OrderCard key={order.id || order.orderId} order={order} />)
        )}
      </div> */}
    </div>
  );
}
