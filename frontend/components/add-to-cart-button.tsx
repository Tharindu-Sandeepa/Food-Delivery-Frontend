"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useAppDispatch } from "@/lib/store/hooks"
import { addItem } from "@/lib/store/cartSlice"
import { v4 as uuidv4 } from "uuid"

interface AddToCartButtonProps {
  menuItem: {
    id: string
    name: string
    price: number
    image: string
  }
  className?: string
}

export function AddToCartButton({ menuItem, className }: AddToCartButtonProps) {
  const dispatch = useAppDispatch()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)

    // Add item to cart
    dispatch(
      addItem({
        id: uuidv4(),
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        image: menuItem.image,
      }),
    )

    // Reset button state after a short delay
    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  return (
    <Button onClick={handleAddToCart} disabled={isAdding} className={className} size="sm">
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isAdding ? "Added!" : "Add to Cart"}
    </Button>
  )
}
