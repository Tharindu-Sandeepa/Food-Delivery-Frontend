import { RestaurantHeader } from "@/components/restaurant-header"
import { MenuList } from "@/components/menu-list"
import { restaurants, menuItems } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurant = restaurants.find((r) => r.id === params.id)

  if (!restaurant) {
    return notFound()
  }

  const restaurantMenu = menuItems.filter((item) => item.restaurantId === restaurant.id)

  return (
    <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <RestaurantHeader restaurant={restaurant} />
        <MenuList items={restaurantMenu} />
      </div>
    </main>
  )
}
