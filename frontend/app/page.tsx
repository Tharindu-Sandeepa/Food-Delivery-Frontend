"use client"
import { useEffect, useState } from "react"
import { RestaurantCard } from "@/components/restaurant-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { BannerSlider } from "@/components/home/banner-slider"
import { FeaturedCategories } from "@/components/home/featured-categories"
import { HowItWorks } from "@/components/home/how-it-works"
import { Footer } from "@/components/footer"

export default function Home() {
  const [restaurants, setRestaurants] = useState([])


  useEffect(() => {
    const fetchRestaurants = async () => {
      const res = await fetch("http://localhost:3002/restaurants")
      const data = await res.json()
      const mappedData = data.map((restaurant: any) => ({
        id: restaurant._id, // remap _id to id
        name: restaurant.name,
        description: restaurant.description,
        image: restaurant.imageUrl,
        location: restaurant.location,
        rating: restaurant.rating,
      }))
      setRestaurants(mappedData)
    }
    fetchRestaurants()
  }, [])

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)]">
        <section className="container mx-auto px-4 pt-6 pb-10">
          <BannerSlider />
        </section>

        <FeaturedCategories />
        <HowItWorks />

        <section className="container mx-auto px-4 py-10" id="restaurants">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <h2 className="text-3xl font-bold">Find your favorite fojjjjod</h2>
              <p className="text-muted-foreground">Order food</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant: any) => (
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