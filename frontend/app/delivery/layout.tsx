"use client";

import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { BASE_URL_DELIVERIES } from "@/lib/constants/Base_url";
import axios from "axios";
import DriverForm from "@/components/delivery/DriverRegistration";
import { useRouter } from "next/navigation";

export default function DeliveryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkDriverRegistration = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("No user ID found in localStorage");
          setLoading(false);
          router.push("/login");
        }

        const response = await axios.get(
          `${BASE_URL_DELIVERIES}/api/drivers/${userId}/checkIsRegistered`
        );
        if (response.data) {
          console.log("Driver registration response:", response.data);
        }

        if (response.data.exists === false) {
          setIsRegistered(false);
        } else {
          setIsRegistered(true);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Type-safe handling of Axios errors
          if (error.response?.status === 404) {
            console.log("Driver not registered:", error.response.data);
          } else {
            console.error("Error checking driver registration:", error.message);
          }
        } else {
          // Handle non-Axios errors
          console.error("Unexpected error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkDriverRegistration();
  }, []);

  console.log("Driver registration status:", isRegistered);

  return (
    <>
      {isRegistered ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar role="delivery" />
          <div className="flex-1 overflow-auto">
            <main className="container mx-auto p-4 lg:p-6">{children}</main>
          </div>

          <Toaster position="top-center" richColors />
        </div>
      ) : (
        <div className="flex h-screen overflow-hidden">
          <div className="flex-1 overflow-auto m-auto">
            <DriverForm />
          </div>

          <Toaster position="top-center" richColors />
        </div>
      )}
    </>
  );
}
