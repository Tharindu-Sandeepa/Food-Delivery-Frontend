"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Loader2,
  RefreshCw,
  Calendar,
  TrendingUp,
  Filter,
  Compass,
  DollarSign,
  Clock,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { Driver, driverService } from "@/lib/driver-api";
import { useDriverStats } from "@/hooks/useDriversStats";
import axios from "axios";
import DriverForm from "./DriverRegistration";

// Dynamic imports for heavy components
const MapWithNoSSR = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="animate-spin h-5 w-5 mr-2" />
      <span>Loading map...</span>
    </div>
  ),
});

const StatCharts = dynamic(() => import("./StatCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <Loader2 className="animate-spin h-5 w-5 mr-2" />
      <span>Loading charts...</span>
    </div>
  ),
});

export default function DriverProfile({
  driver: initialDriver,
  onDriverUpdate,
}: {
  driver: Driver;
  onDriverUpdate: (driver: Driver) => void;
}) {
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(initialDriver);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isediting, setIsEditing] = useState(false);

  // Chart filter state
  const [chartType, setChartType] = useState<
    "hourly" | "daily" | "deliveryTypes"
  >("daily");
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "all"
  >("week");

  // Stats hook
  const {
    stats,
    recentDeliveries = [],
    loading: loadingStats,
    refetchStats,
  } = useDriverStats(driver.userId);

  useEffect(() => {
    const loadDriverData = async () => {
      try {
        const driverId = localStorage.getItem("userId");
        if (!driverId) {
          console.error("No driver ID found in localStorage");
          setLoading(false);
          return;
        }

        const driverData = await driverService.getDriver(driverId);
        const completeDriver = {
          ...driverData,
          contactNumber: driverData.contactNumber || "N/A",
          vehicleType: driverData.vehicleType || "N/A",
          rating: driverData.rating || 0,
        };

        setDriver(completeDriver);
        onDriverUpdate(completeDriver);

        if (completeDriver.location?.coordinates) {
          setPosition([
            completeDriver.location.coordinates[1], // latitude
            completeDriver.location.coordinates[0], // longitude
          ]);
        } else {
          getLocation();
        }
      } catch (error) {
        console.error("Error loading driver data:", error);
        toast.error("Failed to load driver data");
      } finally {
        setLoading(false);
      }
    };

    loadDriverData();
  }, [onDriverUpdate]);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return null;
    }

    return new Promise<[number, number] | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setPosition(newPosition);
          resolve(newPosition);
        },
        (error) => {
          toast.error(`Failed to get location: ${error.message}`);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const updateLocation = async (coordinates: [number, number]) => {
    const driverId = localStorage.getItem("userId");
    if (!driverId) return;

    try {
      await driverService.updateDriver(driverId, {
        location: {
          type: "Point",
          coordinates: [coordinates[1], coordinates[0]], // Note: longitude first for GeoJSON
        },
      });
      toast.success("Location updated successfully");
      refetchStats(); // Refresh stats after location update
    } catch (err) {
      toast.error("Failed to update location");
      console.error("Failed to update location:", err);
    }
  };

  const toggleAvailability = async (newAvailability: boolean) => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      let newPosition = position;

      if (newAvailability) {
        newPosition = await getLocation();
        if (newPosition) {
          await updateLocation(newPosition);
        }
      }

      const updatedDriver = await driverService.updateDriver(driver.userId, {
        available: newAvailability,
        ...(newAvailability && newPosition
          ? {
              location: {
                type: "Point",
                coordinates: [newPosition[1], newPosition[0]],
              },
            }
          : {}),
      });

      const completeDriver = {
        ...updatedDriver,
        contactNumber: updatedDriver.contactNumber || "N/A",
        vehicleType: updatedDriver.vehicleType || "N/A",
      };

      setDriver(completeDriver);
      onDriverUpdate(completeDriver);
      toast.success(`You are now ${newAvailability ? "online" : "offline"}`);
      refetchStats(); // Refresh stats after availability change
    } catch (err) {
      toast.error("Failed to update availability");
      console.error("Toggle availability error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredChartData = useMemo(() => {
    if (!stats) return null;

    switch (chartType) {
      case "hourly":
        return stats.hourly || [];
      case "daily":
        return stats.daily || [];
      case "deliveryTypes":
        return stats.deliveriesByType || [];
      default:
        return stats.daily || [];
    }
  }, [stats, chartType]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 bg-white sm:rounded-xl shadow-md">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blue-500 mr-2" />
          <span>Loading driver profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 bg-white sm:rounded-xl shadow-md">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
        <div className="w-full sm:w-auto flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {driver.name?.charAt(0) || "D"}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center sm:text-left">
                {driver.name || "Unknown Driver"}
              </h2>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {driver.vehicleType}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ★ {driver.rating ? driver.rating.toFixed(1) : "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Package size={12} className="text-gray-500" />
                <span className="text-sm">
                  {stats?.deliveryCount || 0} deliveries
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Clock size={12} className="text-gray-500" />
                <span className="text-sm">
                  Avg. delivery: {stats?.avgDeliveryTime || 0} min
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button
                className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                  driver.available
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                } flex items-center justify-center gap-2`}
                disabled={isUpdating}
                onClick={() => toggleAvailability(!driver.available)}
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : null}
                {driver.available ? "Online" : "Offline"}
              </button>

              <button
                onClick={async () => {
                  const newPosition = await getLocation();
                  if (newPosition) {
                    await updateLocation(newPosition);
                  }
                }}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Update Location
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                disabled={isUpdating}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Earnings Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <DollarSign size={16} className="text-green-500" />
                Earnings Summary
              </h3>
            </div>

            {loadingStats ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 p-4">
                {stats ? (
                  [
                    {
                      label: "Today",
                      icon: <Calendar size={14} />,
                      value: stats.today || 0,
                    },
                    {
                      label: "This Week",
                      icon: <Calendar size={14} />,
                      value: stats.week || 0,
                    },
                    {
                      label: "This Month",
                      icon: <Calendar size={14} />,
                      value: stats.month || 0,
                    },
                    {
                      label: "Total",
                      icon: <TrendingUp size={14} />,
                      value: stats.total || 0,
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                        {stat.icon}
                        <span>{stat.label}</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800">
                        RS. {stat.value.toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center text-gray-500 py-4">
                    No earnings data available
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Recent Activity
              </h3>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                {recentDeliveries.length > 0 ? (
                  recentDeliveries.map((delivery, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Package size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          Delivery #{delivery.id || 1000 + i}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            delivery.time || Date.now()
                          ).toLocaleTimeString()}{" "}
                          • Rs. {delivery.fee?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Compass size={16} className="text-indigo-500" />
                Current Location
              </h3>
            </div>

            <div className="h-80 bg-gray-100 relative z-20">
              {position ? (
                <MapWithNoSSR position={position} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Loading location...
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50">
              {position ? (
                <p className="text-sm text-gray-600">
                  Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                </p>
              ) : (
                <p className="text-sm text-gray-500">Location not available</p>
              )}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-purple-500" />
                Earnings Analytics
              </h3>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      chartType === "daily"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setChartType("daily")}
                  >
                    Daily
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      chartType === "hourly"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setChartType("hourly")}
                  >
                    Hourly
                  </button>
                  <button
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      chartType === "deliveryTypes"
                        ? "bg-white shadow-sm text-blue-600"
                        : "text-gray-600"
                    }`}
                    onClick={() => setChartType("deliveryTypes")}
                  >
                    By Type
                  </button>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                  <select
                    className="text-sm bg-transparent border-none focus:outline-none px-2"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as any)}
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                  </select>
                  <Filter size={14} className="text-gray-500" />
                </div>
              </div>
            </div>

            <div className="p-4 h-80">
              {loadingStats ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                </div>
              ) : filteredChartData ? (
                <StatCharts
                  data={filteredChartData}
                  type={chartType}
                  timeRange={timeRange}
                />
              ) : (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No data available for the selected filters
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isediting && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsEditing(false)}
          />
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-11/12 sm:w-1/3 relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* close icon */}
            <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setIsEditing(false)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <DriverForm />
          </div>
        </div>
      )}
    </div>
  );
}
