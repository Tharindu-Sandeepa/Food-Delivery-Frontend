"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { RestaurantCard } from "@/components/restaurant-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { BannerSlider } from "@/components/home/banner-slider"
import { FeaturedCategories } from "@/components/home/featured-categories"
import { HowItWorks } from "@/components/home/how-it-works"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { restaurantService, Restaurant } from "@/services/restaurantService"

// Interface for user object (based on useAuth usage)
interface User {
  name: string;
  email: string;
  // Add other user properties as needed
}

export default function Home() {
  const { user: authUser, loading: authLoading, error: authError, signIn, logout } = useAuth()
  const [restaurants, setRestaurants] = useState<any[]>([])
  const [filteredRestaurants, setFilteredRestaurants] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize user from local storage on mount
  useEffect(() => {
    const initializeUser = () => {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        }
      } catch (err) {
        console.error("Error reading from local storage:", err)
        toast.error("Failed to load user data")
      } finally {
        setLoading(false)
      }
    }
    initializeUser()
  }, [])

  // Sync authUser with local storage and state
  useEffect(() => {
    if (authUser) {
      try {
        localStorage.setItem("user", JSON.stringify(authUser))
        setUser(authUser)
      } catch (err) {
        console.error("Error saving to local storage:", err)
        toast.error("Failed to save user data")
      }
    }
  }, [authUser])

  // Handle auth errors
  useEffect(() => {
    if (authError) {
      console.error("Auth error:", authError)
      toast.error(authError)
    }
  }, [authError])

  // Fetch restaurants on mount
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log("restaurantService:", restaurantService)

        let fetchedRestaurants: Restaurant[] = []

        if (typeof restaurantService.getAllRestaurants === "function") {
          fetchedRestaurants = await restaurantService.getAllRestaurants()
        } else {
          console.warn("getAllRestaurants not found, falling back to getRestaurantByEmail")
          const restaurant = await restaurantService.getRestaurantByEmail("pizzahut@gmail.com")
          if (restaurant) {
            fetchedRestaurants = [restaurant]
          } else {
            throw new Error("No restaurants found")
          }
        }

        const mappedData = fetchedRestaurants.map((restaurant) => ({
          id: restaurant._id,
          name: restaurant.name,
          description: restaurant.cuisineType,
          image: getImageSrc(restaurant.imageUrl),
          location: restaurant.location,
          rating: restaurant.rating,
        }))

        console.log("Fetched restaurants:", mappedData)
        setRestaurants(mappedData)
        setFilteredRestaurants(mappedData)
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

  // Handle search query changes
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase().trim()
    if (!lowerCaseQuery) {
      setFilteredRestaurants(restaurants)
      return
    }

    const filtered = restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(lowerCaseQuery) ||
        restaurant.description.toLowerCase().includes(lowerCaseQuery)
    )
    setFilteredRestaurants(filtered)
  }, [searchQuery, restaurants])

  // Get image source with validation
  const getImageSrc = (image?: string | null): string => {
    if (!image || typeof image !== "string" || !image.startsWith("/uploads/")) {
      console.warn("Invalid image detected:", image)
      return "/placeholder.svg"
    }
    return `http://localhost:3002${image}`
  }

  // Custom login handler
  // const handleLogin = async (email: string, password: string) => {
  //   try {
  //     await login(email, password)
  //     // User is set in local storage via authUser effect
  //   } catch (err: any) {
  //     console.error("Login error:", err)
  //     toast.error(err.message || "Failed to login")
  //   }
  // }

  // Custom logout handler
  const handleLogout = async () => {
    try {
      await logout()
      localStorage.removeItem("user")
      setUser(null)
    } catch (err: any) {
      console.error("Logout error:", err)
      toast.error(err.message || "Failed to logout")
    }
  }

  return (
    <>
        <main className="min-h-[calc(100vh-4rem)]">
        {/* Auth status display */}
        <div className="container mx-auto px-4 pt-4">
          {loading ? (
            <p>Loading user...</p>
          ) : user ? (
            <div className="flex items-center gap-4">
              {/* <p>Welcome, {user.name}!</p> */}
              {/* <Button variant="outline" onClick={logout}>
                Logout
              </Button> */}
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() =>
                signIn({ email: "test@example.com", password: "password" }) 
              }
            >
              Demo Login
            </Button>
          )}
        </div>

        {/* Hero Banner Slider */}
        <section className="container mx-auto px-4 pt-6 pb-10">
          <BannerSlider />
        </section>

        {/* <FeaturedCategories /> */}

        <section className="container mx-auto px-4 py-10" id="restaurants">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <h2 className="text-3xl font-bold">Find your favorite food</h2>
              <p className="text-muted-foreground">Order food</p>
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Label htmlFor="search" className="sr-only">
                  Search Restaurants
                </Label>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search restaurants by name or cuisine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center">Loading restaurants...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="text-center text-gray-500">
                No restaurants found matching "{searchQuery}"
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>
            )}
          </div>
        </section>
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}