"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppSelector } from "@/lib/store/hooks"
import { selectCartItemsCount } from "@/lib/store/cartSlice"
import Link from "next/link"

export function CartIndicator() {
  const itemCount = useAppSelector(selectCartItemsCount)

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
