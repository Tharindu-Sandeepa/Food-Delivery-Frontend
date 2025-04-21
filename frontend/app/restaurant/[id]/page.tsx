import { RestaurantHeader } from "@/components/restaurant-header"
import { MenuList } from "@/components/menu-list"
import { restaurants, menuItems } from "@/lib/mock-data"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurantRes = await fetch(`http://localhost:3002/restaurants/${params.id}`)

  if (!restaurantRes.ok) {
    console.log("Restaurant not found")
  }

  const restaurant = await restaurantRes.json()

  const menuRes = await fetch(`http://localhost:3002/restaurants/menu?restaurantId=${params.id}`)
  const rawMenuItems = await menuRes.json()

  const menuItems = rawMenuItems.map((item: any) => ({
    id: item._id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.imageUrl,
    category: item.category,
    restaurantId: item.restaurantId
  }))

  return (
    <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <RestaurantHeader restaurant={restaurant} />
        <MenuList items={menuItems} />
      </div>
    </main>
  )
}