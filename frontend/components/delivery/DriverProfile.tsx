"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3003/api";

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

interface DriverStats {
  today: number;
  week: number;
  month: number;
  total: number;
}

const MapWithNoSSR = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center">Loading map...</div>,
});

export default function DriverProfile() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DriverStats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Get driverId from localStorage
  const driverId = localStorage.getItem("userId");

  const fetchDriver = async() => {
    if (!driverId) {
      setError("No driver ID found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<Driver>(`${BASE_URL}/drivers/${driverId}`);
      console.log("Fetched driver data:", response.data); // Debug log
      setDriver(response.data);
      setIsAvailable(response.data.available);

      if (response.data.location?.coordinates) {
        setPosition([
          response.data.location.coordinates[1], // Latitude
          response.data.location.coordinates[0], // Longitude
        ]);
      }
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setError(error.response?.data?.error || "Failed to load driver profile");
      console.error("Fetch driver error:", error); // Debug log
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, []);

  const fetchStats = async () => {
    if (!driverId) return;
    try {
      const response = await axios.get<DriverStats>(`${BASE_URL}/drivers/${driverId}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    return new Promise<void>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setPosition(newPosition);
          resolve();
        },
        (error) => {
          setError(`Failed to get location: ${error.message}`);
          resolve();
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const updateLocation = async (coordinates: [number, number]) => {
    if (!driverId) return;
    try {
      await axios.put(`${BASE_URL}/drivers/${driverId}`, {
        location: {
          type: "Point",
          coordinates: [coordinates[1], coordinates[0]],
        },
      });
    } catch (err) {
      console.error("Failed to update location:", err);
      setError("Failed to update location");
    }
  };

  const toggleAvailability = async (newAvailability: boolean) => {
    if (!driver || !driverId || isUpdating) return;

    setIsUpdating(true);
    try {
      // If becoming available, get fresh location first
      if (newAvailability) {
        await getLocation();
      }

      const response = await axios.put<Driver>(`${BASE_URL}/drivers/${driverId}`, {
        available: newAvailability,
        ...(newAvailability && position
          ? {
              location: {
                type: "Point",
                coordinates: [position[1], position[0]],
              },
            }
          : {}),
      });

      console.log("Updated driver data:", response.data); // Debug log
      setDriver(response.data);
      setIsAvailable(newAvailability);
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setError(error.response?.data?.error || "Failed to update availability");
      console.error("Toggle availability error:", error); // Debug log
    } finally {
      setIsUpdating(false);
    }
  };

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
        <div className="bg-red-100 text-red-700 p-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => {
              setError("");
              setLoading(true);
              fetchDriver();
              fetchStats();
              getLocation();
            }}
            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!driver) {
    return <div className="text-center p-6">Driver not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Section */}
        <div className="md:w-1/3 space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{driver.name || "Unknown Driver"}</h2>
            <p className="mb-2">
              <span className="font-semibold text-gray-600">Contact:</span>{" "}
              {driver.contactNumber || "N/A"}
            </p>
            <p className="mb-2">
              <span className="font-semibold text-gray-600">Vehicle:</span>{" "}
              {driver.vehicleType || "N/A"}
            </p>
            <p className="mb-4">
              <span className="font-semibold text-gray-600">Rating:</span>{" "}
              {driver.rating ? `${driver.rating}/5` : "N/A"}
            </p>

            <div className="flex items-center mb-4">
              <span className="font-semibold text-gray-600 mr-2">Availability:</span>
              <button
                className={`px-4 py-2 rounded font-semibold text-white transition-colors ${
                  isAvailable
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={isUpdating}
                onClick={() => toggleAvailability(!isAvailable)}
              >
                {isUpdating ? (
                  <Loader2 className="animate-spin h-4 w-4 inline mr-2" />
                ) : null}
                {isAvailable ? "Online" : "Offline"}
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Earnings</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Today", value: stats.today },
                { label: "This Week", value: stats.week },
                { label: "This Month", value: stats.month },
                { label: "Total", value: stats.total },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-800">${stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="md:w-2/3">
          <div className="h-96 bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            {position ? (
              <MapWithNoSSR position={position} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Unable to load map. Please enable location services.
              </div>
            )}
          </div>
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Current Location</h3>
            {position ? (
              <p className="text-gray-600">
                Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
              </p>
            ) : (
              <p className="text-gray-500">Location not available</p>
            )}
            <button
              onClick={getLocation}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}