"use client"
import { useState, useEffect } from "react"
import { MenuManagement } from "@/components/admin/menu-management"
import { DashboardHeader } from "@/components/dashboard-header"
import { useAuth } from "@/hooks/useAuth"

export default function MenuManagementPage() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Get email from user object or fall back to localStorage
  const getOwnerEmail = (): string => {
    if (user?.email) {
      return user.email
    }
    try {
      const storedUser = localStorage.getItem("user")
      const parsedUser = storedUser ? JSON.parse(storedUser) : null
      return parsedUser?.email || ""
    } catch (err) {
      console.error("Error reading from localStorage:", err)
      return ""
    }
  }

  const ownerEmail = getOwnerEmail()

  useEffect(() => {
    console.log("User data:", user)
  }, [user])

  useEffect(() => {
    const fetchRestaurantByEmail = async () => {
      if (!ownerEmail) {
        setError("No user email found")
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`http://localhost:3002/restaurants/email/${encodeURIComponent(ownerEmail)}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Restaurant not found for email: ${ownerEmail}`)
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
  }, [ownerEmail])

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