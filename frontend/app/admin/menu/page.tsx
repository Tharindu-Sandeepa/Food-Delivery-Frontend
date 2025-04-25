"use client"
import { useState, useEffect } from "react"
import { MenuManagement } from "@/components/admin/menu-management"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/lib/hooks/useAuth"


export default function MenuManagementPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const email = user?.email || "";

  useEffect(() => {
    console.log("jjjjjjj",user);
  }
  , [user])

  const OWNER_EMAIL = "pizzahut@gmail.com"


  useEffect(() => {
    const fetchRestaurantByEmail = async () => {
      try {
        const response = await fetch(`http://localhost:3002/restaurants/email/${OWNER_EMAIL}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Restaurant not found for email: test@gmail.com")
          }
          throw new Error("Failed to fetch restaurant")
        }
        const restaurant = await response.json()
        setRestaurantId(restaurant._id)
      } catch (err: any) {
        console.error("Error fetching restaurant:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRestaurantByEmail()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading restaurant data...
      </div>
    )
  }

  if (error || !restaurantId) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error || "Failed to load restaurant data"}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Menu Management"
        description="Add, edit, and manage your restaurant's menu items"
      />
      <MenuManagement restaurantId={restaurantId} />
    </div>
  )
}