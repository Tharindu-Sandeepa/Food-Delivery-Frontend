"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Address {
  lat: number;
  lng: number;
  address: string;
}

interface Order {
  _id: string;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
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
  deliveryAddress: Address;
  restaurantLocation: Address;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  paymentMethod?: string;
  contactNumber?: string;
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
      case "ready":
        return "bg-orange-500";
      case "assigned":
        return "bg-indigo-500";
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
          <p className="text-muted-foreground">No orders in this category</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.orderId || order._id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{order.restaurantName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Order #{order.orderId ? order.orderId.slice(0, 8) : "Unknown"} •{" "}
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>
              <Badge className={`${getStatusColor(order.status)} text-white`}>
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
                <p>Delivery to: {order.deliveryAddress.address}</p>
                {order.deliveryPersonId && (
                  <p>
                    Driver: {order.deliveryPersonName || `#${order.deliveryPersonId.slice(0, 6)}`}
                  </p>
                )}
                {order.contactNumber && <p>Contact Number: {order.contactNumber}</p>}
                {order.paymentMethod && <p>Payment: {order.paymentMethod}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}