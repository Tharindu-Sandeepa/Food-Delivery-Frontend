"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  status: "pending" | "preparing" | "delivering" | "completed" | "cancelled";
  total: number;
  createdAt: string;
  deliveryAddress: string;
  deliveryPersonId?: string;
  deliveryId?: string;
}

interface OrderListProps {
  orders: Order[];
}

export function OrderList({ orders }: OrderListProps) {
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "preparing":
        return "bg-blue-500";
      case "delivering":
        return "bg-purple-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatStatus = (status: Order["status"]) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">You don't have any orders yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{order.restaurantName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Order #{order.id.slice(0, 8)} •{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge className={getStatusColor(order.status) + " text-white"}>
                {formatStatus(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>Delivery to: {order.deliveryAddress}</p>
              </div>

              {order.status === "delivering" && (
                <Button asChild className="w-full sm:w-auto mt-2">
                  <Link href={`/tracking/${order.deliveryId}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Track Delivery
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
