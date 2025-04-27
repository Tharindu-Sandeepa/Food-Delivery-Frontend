"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Minus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category: string;
  restaurantId: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
}

interface MenuListProps {
  items: MenuItem[];
}

export function MenuList({ items }: MenuListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const categories = [
    "all",
    ...new Set(items.map((item) => item.category || "Uncategorized")),
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        const response = await fetch(
          `http://localhost:3001/api/cart/${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          setCartItems(
            data.items.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  const addToCart = async (item: MenuItem) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      description: item.description,
      image: item.image,
      category: item.category,
      restaurantId: item.restaurantId,
      isVegetarian: item.isVegetarian || false,
      isVegan: item.isVegan || false,
      quantity: 1,
    };

    try {
      const response = await fetch("http://localhost:3001/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, item: cartItem }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      const data = await response.json();
      setCartItems((prev) => {
        const existingItem = prev.find((i) => i.id === item.id);
        if (existingItem) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { id: item.id, quantity: 1 }];
      });

      toast({
        title: "Success",
        description: `${item.name} added to cart!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
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
      const response = await fetch("http://localhost:3001/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, itemId, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update cart");
      }

      const data = await response.json();
      if (newQuantity === 0) {
        setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      } else {
        setCartItems((prev) =>
          prev.map((i) =>
            i.id === itemId ? { ...i, quantity: newQuantity } : i
          )
        );
      }

      toast({
        title: "Success",
        description: `Updated quantity for item in cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search menu items..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeCategory}
        onValueChange={setActiveCategory}
      >
        <TabsList className="mb-4 flex flex-wrap h-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No menu items available for this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const cartItem = cartItems.find((ci) => ci.id === item.id);
                const quantity = cartItem ? cartItem.quantity : 0;

                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex h-24">
                      <div className="flex-1 p-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description || "No description available"}
                        </p>
                        <p className="mt-1 font-medium">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="relative w-24 h-24">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        {quantity === 0 ? (
                          <Button
                            size="icon"
                            className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                            onClick={(e) => {
                              e.preventDefault();
                              addToCart(item);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                            <Button
                              size="icon"
                              className="h-6 w-6 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
                              onClick={(e) => {
                                e.preventDefault();
                                updateQuantity(item.id, quantity - 1);
                              }}
                            >
                              <Minus className="h-3 w-3 text-gray-600" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center bg-white border border-gray-300 rounded px-1 py-0.5">
                              {quantity}
                            </span>
                            <Button
                              size="icon"
                              className="h-6 w-6 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
                              onClick={(e) => {
                                e.preventDefault();
                                updateQuantity(item.id, quantity + 1);
                              }}
                            >
                              <Plus className="h-3 w-3 text-gray-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
