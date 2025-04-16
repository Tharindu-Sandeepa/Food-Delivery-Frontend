import { Card, CardContent } from "@/components/ui/card"
import { Search, UtensilsCrossed, Truck } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Search",
    description: "Find your favorite restaurants or discover new ones nearby",
    icon: Search,
  },
  {
    id: 2,
    title: "Order",
    description: "Choose from a variety of delicious meals and place your order",
    icon: UtensilsCrossed,
  },
  {
    id: 3,
    title: "Delivery",
    description: "Track your order in real-time as it makes its way to you",
    icon: Truck,
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl">Getting your favorite food delivered is as easy as 1-2-3</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Card key={step.id} className="border-none shadow-sm">
                <CardContent className="flex flex-col items-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
