"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderList } from "@/components/order-list";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";

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

interface AdminDashboardProps {
  orders: Order[];
}

export function AdminDashboard({ orders }: AdminDashboardProps) {
  // Calculate stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalCustomers = new Set(orders.map((order) => order.orderId.slice(-4))).size; // Mock unique customers

  // Get the most recent order for each status
  const getMostRecentOrder = (status: Order["status"]) => {
    return orders
      .filter((order) => order.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  const recentOrders = {
    pending: getMostRecentOrder("pending"),
    preparing: getMostRecentOrder("preparing"),
    ready: getMostRecentOrder("ready"),
    assigned: getMostRecentOrder("assigned"),
    delivering: getMostRecentOrder("delivering"),
    completed: getMostRecentOrder("completed"),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">${totalRevenue.toFixed(2)}</div>
              <p className="dashboard-stat-label">+20.1% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{totalOrders}</div>
              <p className="dashboard-stat-label">+12.5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">{totalCustomers}</div>
              <p className="dashboard-stat-label">+5.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="dashboard-stat">
              <div className="dashboard-stat-value">12.5%</div>
              <p className="dashboard-stat-label">+2.1% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="pending">
                Pending ({orders.filter((o) => o.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="preparing">
                Preparing ({orders.filter((o) => o.status === "preparing").length})
              </TabsTrigger>
              <TabsTrigger value="ready">
                Ready ({orders.filter((o) => o.status === "ready").length})
              </TabsTrigger>
              <TabsTrigger value="assigned">
                Assigned ({orders.filter((o) => o.status === "assigned").length})
              </TabsTrigger>
              <TabsTrigger value="delivering">
                Delivering ({orders.filter((o) => o.status === "delivering").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({orders.filter((o) => o.status === "completed").length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <OrderList orders={recentOrders.pending ? [recentOrders.pending] : []} />
            </TabsContent>
            <TabsContent value="preparing">
              <OrderList orders={recentOrders.preparing ? [recentOrders.preparing] : []} />
            </TabsContent>
            <TabsContent value="ready">
              <OrderList orders={recentOrders.ready ? [recentOrders.ready] : []} />
            </TabsContent>
            <TabsContent value="assigned">
              <OrderList orders={recentOrders.assigned ? [recentOrders.assigned] : []} />
            </TabsContent>
            <TabsContent value="delivering">
              <OrderList orders={recentOrders.delivering ? [recentOrders.delivering] : []} />
            </TabsContent>
            <TabsContent value="completed">
              <OrderList orders={recentOrders.completed ? [recentOrders.completed] : []} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}