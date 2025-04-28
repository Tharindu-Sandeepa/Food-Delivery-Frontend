import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Restaurant {
  id: string
  name: string
  image?: string
  cuisineType?: string
  rating?: number
  address?: string
  description?: string
  isAvailable?: boolean
  openingHours?: {
    open: string // Format: "HH:mm"
    close: string // Format: "HH:mm"
  }
}

interface RestaurantCardProps {
  restaurant: Restaurant
}

// Simplified Tooltip Component
function Tooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded-lg p-2 w-48 z-10 -top-10 left-0">
        {content}
      </div>
    </div>
  )
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  useEffect(() => {
    console.log("Restaurant data:", restaurant)
  }, [restaurant])

  return (
    <Link href={`/restaurant/${restaurant.id}`} aria-label={`View details for ${restaurant.name}`}>
      <Card className="overflow-hidden transition-transform duration-300 hover:scale-[1.03] hover:shadow-xl rounded-2xl border-none bg-white">
        {/* Restaurant Image */}
        <div className="relative aspect-[4/3]">
          <Image
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            fill
            className="object-cover rounded-t-2xl"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            priority={true}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-t-2xl" />
          {/* Rating Badge */}
          {restaurant.rating !== undefined && (
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 px-2.5 py-1 text-sm bg-white/95 text-gray-900 font-semibold flex items-center gap-1.5"
            >
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              {restaurant.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5">
          <div className="space-y-3">
            <h3 className="font-extrabold text-2xl text-gray-900 line-clamp-1">{restaurant.name}</h3>
            {restaurant.cuisineType && (
              <p className="text-sm text-indigo-600 font-medium capitalize">{restaurant.cuisineType}</p>
            )}
            {(restaurant.address || restaurant.description) && (
              <Tooltip content={restaurant.description || restaurant.address || "No description available"}>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed cursor-pointer hover:text-indigo-500 transition-colors">
                  {restaurant.description || restaurant.address}
                </p>
              </Tooltip>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        {restaurant.openingHours && (
          <CardFooter className="p-5 pt-0 flex justify-between text-xs text-gray-600 bg-gray-100 rounded-b-2xl">
            <span>Opens: {restaurant.openingHours.open}</span>
            <span>Closes: {restaurant.openingHours.close}</span>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}

export function RestaurantList() {
  // Mock data (replace with real data from API or props)
  const restaurants: Restaurant[] = Array.from({ length: 20 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Restaurant ${i + 1}`,
    image: `/restaurant-${i % 5 + 1}.jpg`,
    cuisineType: ["Italian", "Mexican", "Japanese", "Indian", "French"][i % 5],
    rating: 3.5 + (i % 5) * 0.3,
    address: `123${i} Main St, City ${i + 1}`,
    description: `Delicious ${["Italian", "Mexican", "Japanese", "Indian", "French"][i % 5]} cuisine with a cozy ambiance and friendly staff.`,
    isAvailable: true,
    openingHours: {
      open: "11:00",
      close: "22:00",
    },
  }))

  const [visibleCount, setVisibleCount] = useState(10)

  const handleShowMore = () => {
    setVisibleCount((prev) => Math.min(prev + 10, restaurants.length))
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.slice(0, visibleCount).map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
      {visibleCount < restaurants.length && (
        <div className="mt-8 text-center">
          <Button
            onClick={handleShowMore}
            className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-full font-semibold"
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  )
}