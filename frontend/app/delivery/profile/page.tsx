"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import DriverProfile from "@/components/delivery/DriverProfile";
import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";


interface Driver {
  _id: string;
  userId: string;
  name: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  available: boolean;
  currentDelivery?: string;
  vehicleType: string;
  rating: number;
  contactNumber: string;
}

// Create a minimal initial driver object
const createInitialDriver = (userId: string): Driver => ({
  _id: "",
  userId,
  name: "",
  location: {
    type: "Point",
    coordinates: [0, 0],
  },
  available: false,
  vehicleType: "",
  rating: 0,
  contactNumber: "",
});

export default function DriverProfilePage() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDriver = async () => {
    try {
      // Check if we're running on client side before accessing localStorage
      if (typeof window === "undefined") {
        setError("Please log in to access this page");
        setLoading(false);
        return;
      }

      const driverId = localStorage.getItem("userId");
      if (!driverId) {
        setError("No driver ID found. Please log in.");
        setLoading(false);
        return;
      }

      // Start with an initial driver object so component can render
      // Actual data will be loaded by the DriverProfile component directly
      setDriver(createInitialDriver(driverId));
      setLoading(false);
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setError(error.response?.data?.error || "Failed to load driver profile");
      console.error("Fetch driver error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Delivery Dashboard"
        description="Manage your active deliveries"
      />

      {driver ? (
        <DriverProfile driver={driver} onDriverUpdate={setDriver} />
      ) : null}
    </div>
  );
}
