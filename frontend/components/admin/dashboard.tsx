import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderList } from "@/components/order-list"
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react"

interface Order {
  id: string
  restaurantId: string
  restaurantName: string
  items: Array<{ id: string; name: string; price: number; quantity: number }>
  status: "pending" | "preparing" | "delivering" | "completed" | "cancelled"
  total: number
  createdAt: string
  deliveryAddress: string
  deliveryPersonId?: string
}

interface AdminDashboardProps {
  orders: Order[]
}

export function AdminDashboard({ orders }: AdminDashboardProps) {
  // Calculate stats
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalCustomers = new Set(orders.map((order) => order.id.slice(-4))).size // Mock unique customers

  // Filter orders by status
  const pendingOrders = orders.filter((order) => order.status === "pending")
  const preparingOrders = orders.filter((order) => order.status === "preparing")
  const deliveringOrders = orders.filter((order) => order.status === "delivering")
  const completedOrders = orders.filter((order) => order.status === "completed")

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
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="preparing">Preparing ({preparingOrders.length})</TabsTrigger>
              <TabsTrigger value="delivering">Delivering ({deliveringOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <OrderList orders={pendingOrders} />
            </TabsContent>
            <TabsContent value="preparing">
              <OrderList orders={preparingOrders} />
            </TabsContent>
            <TabsContent value="delivering">
              <OrderList orders={deliveringOrders} />
            </TabsContent>
            <TabsContent value="completed">
              <OrderList orders={completedOrders} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
