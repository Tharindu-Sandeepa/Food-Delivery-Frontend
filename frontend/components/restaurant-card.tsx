import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { useEffect } from "react"

interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    image?: string
    cuisineType?: string
    rating?: number
    address?: string
    isAvailable?: boolean
    openingHours?: {
      open: string // Format: "HH:mm"
      close: string // Format: "HH:mm"
    }
  }
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  useEffect(() => {
    console.log("Restaurant data:", restaurant)
  }, [restaurant])

  return (
    <Link href={`/restaurant/${restaurant.id}`} aria-label={`View details for ${restaurant.name}`}>
      <Card className="overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg rounded-xl border-none bg-white">
        {/* Restaurant Image */}
        <div className="relative aspect-video">
          <Image
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            fill
            className="object-cover rounded-t-xl"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true}
          />
          {/* Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-t-xl" />
          {/* Rating Badge in Top Left */}
          {restaurant.rating !== undefined && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 px-2 py-1 text-xs bg-white/90 text-gray-800 font-medium flex items-center gap-1"
            >
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {restaurant.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{restaurant.name}</h3>
            {restaurant.cuisineType && (
              <p className="text-sm text-gray-600 capitalize">{restaurant.cuisineType}</p>
            )}
            {restaurant.address && (
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{restaurant.address}</p>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        {restaurant.openingHours && (
          <CardFooter className="p-4 pt-0 flex justify-between text-xs text-gray-500 bg-gray-50 rounded-b-xl">
            <span>Opens: {restaurant.openingHours.open}</span>
            <span>Closes: {restaurant.openingHours.close}</span>
          </CardFooter>
        )}
      </Card>
    </Link>
  )
}