export interface Location {
    longitude: number
    latitude: number
  }
  
  export interface Restaurant {
    _id: string
    name: string
    email: string
    imageUrl?: string | null
    cuisineType: string
    address: string
    location: Location
    isAvailable: boolean
    rating: number
    openingHours?: {
      open: string
      close: string
    }
    deliveryZones: string[]
    createdAt: string
  }
  
  export interface RestaurantFormData {
    name: string
    email: string
    address: string
    cuisineType: string
    openingHours: {
      open: string
      close: string
    }
    deliveryZones: string
    location: Location
    isAvailable: boolean
  }
  
  const API_BASE_URL = "http://localhost:3002"
  
  export const restaurantService = {
    // Fetch restaurant by email
    async getRestaurantByEmail(email: string): Promise<Restaurant | null> {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurants/email/${encodeURIComponent(email)}`)
        if (!response.ok) {
          if (response.status === 404) return null
          throw new Error("Failed to fetch restaurant")
        }
        return await response.json()
      } catch (error) {
        console.error("Error fetching restaurant by email:", error)
        throw error
      }
    },
  
    // Create a new restaurant
    async createRestaurant(formData: RestaurantFormData, imageFile?: File): Promise<Restaurant> {
      try {
        const formDataToSend = new FormData()
        formDataToSend.append("name", formData.name)
        formDataToSend.append("email", formData.email)
        formDataToSend.append("address", formData.address)
        formDataToSend.append("cuisineType", formData.cuisineType)
        formDataToSend.append("openingHours", JSON.stringify(formData.openingHours))
        formDataToSend.append("deliveryZones", formData.deliveryZones)
        formDataToSend.append("location[latitude]", formData.location.latitude.toString())
        formDataToSend.append("location[longitude]", formData.location.longitude.toString())
        formDataToSend.append("isAvailable", formData.isAvailable.toString())
        if (imageFile) {
          formDataToSend.append("image", imageFile)
        }
  
        const response = await fetch(`${API_BASE_URL}/restaurants`, {
          method: "POST",
          body: formDataToSend,
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create restaurant")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error creating restaurant:", error)
        throw error
      }
    },
  
    // Update an existing restaurant
    async updateRestaurant(id: string, formData: RestaurantFormData, imageFile?: File): Promise<Restaurant> {
      try {
        const formDataToSend = new FormData()
        formDataToSend.append("name", formData.name)
        formDataToSend.append("email", formData.email)
        formDataToSend.append("address", formData.address)
        formDataToSend.append("cuisineType", formData.cuisineType)
        formDataToSend.append("openingHours", JSON.stringify(formData.openingHours))
        formDataToSend.append("deliveryZones", formData.deliveryZones)
        formDataToSend.append("location[latitude]", formData.location.latitude.toString())
        formDataToSend.append("location[longitude]", formData.location.longitude.toString())
        formDataToSend.append("isAvailable", formData.isAvailable.toString())
        if (imageFile) {
          formDataToSend.append("image", imageFile)
        }
  
        const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
          method: "PUT",
          body: formDataToSend,
        })
  
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to update restaurant")
        }
  
        return await response.json()
      } catch (error) {
        console.error("Error updating restaurant:", error)
        throw error
      }
    },
  
    // Delete a restaurant
    async deleteRestaurant(id: string): Promise<void> {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
          method: "DELETE",
        })
  
        if (!response.ok) {
          throw new Error("Failed to delete restaurant")
        }
      } catch (error) {
        console.error("Error deleting restaurant:", error)
        throw error
      }
    },
  }