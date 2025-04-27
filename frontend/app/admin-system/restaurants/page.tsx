"use client"
import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { RestaurantManagement } from "@/components/admin-system/restaurant-management"
import { restaurantService, Restaurant } from "@/services/restaurantService"
import { toast } from "sonner"

export default function RestaurantManagementPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const fetchedRestaurants = await restaurantService.getAllRestaurants()
        setRestaurants(fetchedRestaurants)
        console.log("Fetched restaurants:", fetchedRestaurants)
      } catch (err: any) {
        console.error("Error fetching restaurants:", err)
        setError(err.message || "Failed to load restaurants")
        toast.error(err.message || "Failed to load restaurants")
      } finally {
        setIsLoading(false)
      }
    }
    fetchRestaurants()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading restaurants...
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Restaurant Management" description="Approve, reject, and manage platform restaurants" />
      <RestaurantManagement restaurants={restaurants} />
    </div>
  )
}