import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface Category {
  id: string
  name: string
  image: string
  count: number
}

const categories: Category[] = [
  {
    id: "1",
    name: "Pizza",
    image: "/placeholder.svg?height=200&width=200",
    count: 24,
  },
  {
    id: "2",
    name: "Burgers",
    image: "/placeholder.svg?height=200&width=200",
    count: 18,
  },
  {
    id: "3",
    name: "Sushi",
    image: "/placeholder.svg?height=200&width=200",
    count: 12,
  },
  {
    id: "4",
    name: "Italian",
    image: "/placeholder.svg?height=200&width=200",
    count: 15,
  },
  {
    id: "5",
    name: "Mexican",
    image: "/placeholder.svg?height=200&width=200",
    count: 10,
  },
  {
    id: "6",
    name: "Desserts",
    image: "/placeholder.svg?height=200&width=200",
    count: 20,
  },
]

export function FeaturedCategories() {
  return (
    <section className="py-10" id="categories">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">Browse by Category</h2>
          <p className="text-muted-foreground max-w-2xl">Explore restaurants by your favorite food categories</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link href={`/?category=${category.name.toLowerCase()}`} key={category.id}>
              <Card className="overflow-hidden transition-all hover:shadow-md h-full">
                <CardContent className="p-0 flex flex-col items-center">
                  <div className="relative w-full aspect-square">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-medium">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} places</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
