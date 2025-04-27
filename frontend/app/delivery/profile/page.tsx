import { DashboardHeader } from "@/components/dashboard-header";
import DriverProfile from "@/components/delivery/DriverProfile";

export default function DriverProfilePage() {
  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Delivery Dashboard"
        description="Manage your active deliveries"
      />

      <DriverProfile />
    </div>
  );
}
