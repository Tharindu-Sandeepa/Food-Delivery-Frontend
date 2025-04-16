import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface RestaurantCardProps {
  restaurant: {
    id: string
    name: string
    image: string
    cuisine: string
    rating: number
    deliveryTime: string
    minimumOrder: number
  }
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-video relative">
          <Image src={restaurant.image || "/placeholder.svg"} alt={restaurant.name} fill className="object-cover" />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{restaurant.name}</h3>
              <p className="text-muted-foreground text-sm">{restaurant.cuisine}</p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              {restaurant.rating}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between text-sm text-muted-foreground">
          <span>{restaurant.deliveryTime} min</span>
          <span>Min. ${restaurant.minimumOrder}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
