"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export function CartList() {
  const [items, setItems] = useState<CartItem[]>([]);

  // Fetch cart items on mount
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        toast({
          title: "Error",
          description: "Please log in to view your cart.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/cart/${userId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }
        const data = await response.json();
        setItems(data.items);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    };
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (id: string, change: number) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to update your cart.",
        variant: "destructive",
      });
      return;
    }

    const item = items.find((item) => item.id === id);
    if (!item) return;

    const newQuantity = item.quantity + change;

    try {
      const response = await fetch("http://localhost:3001/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, itemId: id, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      const data = await response.json();
      setItems(data.items);
      toast({
        title: "Success",
        description: `Updated quantity for ${item.name}.`,
      });
      // Dispatch custom event to notify CartSummary
      console.log("Dispatching cartUpdated event from CartList");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (id: string) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to update your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/cart/${userId}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      const data = await response.json();
      setItems(data.items);
      toast({
        title: "Success",
        description: "Item removed from cart.",
      });
      // Dispatch custom event to notify CartSummary
      console.log("Dispatching cartUpdated event from CartList");
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Your cart is empty</p>
          <Button className="mt-4" asChild>
            <a href="/">Browse Restaurants</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-md overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} x {item.quantity}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
