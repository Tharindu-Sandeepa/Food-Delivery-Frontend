import { RestaurantCard } from "@/components/restaurant-card"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import { BannerSlider } from "@/components/home/banner-slider"
import { FeaturedCategories } from "@/components/home/featured-categories"
import { HowItWorks } from "@/components/home/how-it-works"
import { Footer } from "@/components/footer"
import { restaurants } from "@/lib/mock-data"

export default function Home() {
  return (
    <>
      <main className="min-h-[calc(100vh-4rem)]">
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
