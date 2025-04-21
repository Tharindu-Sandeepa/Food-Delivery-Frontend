"use client"

import { RestaurantCard } from "@/components/restaurant-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { BannerSlider } from "@/components/home/banner-slider"
import { FeaturedCategories } from "@/components/home/featured-categories"
import { HowItWorks } from "@/components/home/how-it-works"
import { Footer } from "@/components/footer"
import { restaurants } from "@/lib/mock-data"
import { useAuth } from "@/lib/hooks/useAuth"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const { user, loading, error, login, logout } = useAuth()

  useEffect(() => {
    if (error) {
      console.error("Auth error:", error)
    }
  }, [error])

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)]">
        {/* Example auth status display */}
        <div className="container mx-auto px-4 pt-4">
          {loading ? (
            <p>Loading user...</p>
          ) : user ? (
            <div className="flex items-center gap-4">
              <p>Welcome, {user.name}!</p>
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => login("test@example.com", "password")}
            >
              Demo Login
            </Button>
          )}
        </div>

        {/* Hero Banner Slider */}
        <section className="container mx-auto px-4 pt-6 pb-10">
          <BannerSlider />
        </section>

        {/* Featured Categories */}
        <FeaturedCategories />

        {/* How It Works */}
        <HowItWorks />

        {/* Restaurant Listings */}
        <section className="container mx-auto px-4 py-10" id="restaurants">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <h2 className="text-3xl font-bold">Find your favorite food</h2>
              <p className="text-muted-foreground">Order food from the best restaurants in your area</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <SearchBar />
              <CategoryFilter />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}