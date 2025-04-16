"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Sushi",
  "Chinese",
  "Italian",
  "Mexican",
  "Indian",
  "Thai",
  "Vegetarian",
  "Desserts",
  "Fast Food",
]

export function CategoryFilter() {
  const [selected, setSelected] = useState("All")

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-2 p-1">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selected === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelected(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
