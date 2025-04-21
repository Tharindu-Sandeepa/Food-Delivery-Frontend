"use client"
import { useEffect, useState } from "react"
import axios from "axios"
import { DashboardHeader } from "@/components/dashboard-header"
import { RestaurantManagement } from "@/components/admin-system/restaurant-management"

export default function RestaurantManagementPage() {
  const [restaurants, setRestaurants] = useState([])

  useEffect(() => {
    const fetchRestaurants = async () => {
      const res = await axios.get("http://localhost:3002/restaurants/")
      setRestaurants(res.data)
      console.log("Fetched restaurantsggggggggg:", res.data)
    }
    fetchRestaurants()
  }, [])

  return (
    <div className="space-y-6">
      <DashboardHeader title="Restaurant Management" description="Approve, reject, and manage platform restaurants" />
      <RestaurantManagement restaurants={restaurants} />

    </div>
  )
}