"use client";

import { useEffect, useState } from "react";
import { RestaurantCard } from "@/components/restaurant-card";
import { CategoryFilter } from "@/components/category-filter";
import { SearchBar } from "@/components/search-bar";
import { BannerSlider } from "@/components/home/banner-slider";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { HowItWorks } from "@/components/home/how-it-works";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  rating: number;
}

export default function Home() {
  const { user, loading, error, signIn, logout } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    if (error) {
      console.error("Auth error:", error);
    }
  }, [error]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await fetch("http://localhost:3002/restaurants");
        const data = await res.json();
        const mappedData = data.map((restaurant: any) => ({
          id: restaurant._id,
          name: restaurant.name,
          description: restaurant.description,
          image: restaurant.imageUrl,
          location: restaurant.location,
          rating: restaurant.rating,
        }));
        setRestaurants(mappedData);
      } catch (err) {
        console.error("Failed to fetch restaurants:", err);
      }
    };
    fetchRestaurants();
  }, []);

  return (
    <>
      <main className="min-h-[calc(100vh-4rem)]">
        {/* Auth status display */}
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

        <FeaturedCategories />
        <HowItWorks />

        <section className="container mx-auto px-4 py-10" id="restaurants">
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <h2 className="text-3xl font-bold">Find your favorite food</h2>
              <p className="text-muted-foreground">Order food</p>
            </div>

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div> */}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}