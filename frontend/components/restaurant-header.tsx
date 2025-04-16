import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Star } from "lucide-react"

interface RestaurantHeaderProps {
  restaurant: {
    id: string
    name: string
    image: string
    cuisine: string
    rating: number
    deliveryTime: string
    address: string
  }
}

export function RestaurantHeader({ restaurant }: RestaurantHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
        <Image src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold">{restaurant.name}</h1>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {restaurant.rating}
          </Badge>
        </div>

        <p className="text-muted-foreground">{restaurant.cuisine}</p>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{restaurant.address}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{restaurant.deliveryTime} min delivery time</span>
          </div>
        </div>
      </div>
    </div>
  )
}
