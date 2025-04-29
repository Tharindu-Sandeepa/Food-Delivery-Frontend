"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { OrderListCustomer } from "@/components/customer/OrderListCustomer";

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

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;
      if (!userId) {
        toast({
          title: "Error",
          description: "Please log in to view your orders.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/orders/customer/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        const data = await response.json();

        // Map API response to Order interface
        const mappedOrders: Order[] = data.map((order: any) => ({
          id: order._id,
          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          deliveryAddress: order.deliveryAddress.address,
          deliveryPersonId: order.deliveryPersonId,
          deliveryId: order.deliveryId,
        }));

        setOrders(mappedOrders);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "An error occurred while fetching orders",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Your Orders</h1>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>
        <OrderListCustomer orders={orders as any} />
      </div>
    </main>
  );
}
