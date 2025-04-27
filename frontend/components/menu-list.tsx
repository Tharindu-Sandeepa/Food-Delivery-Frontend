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
  restaurantId: string;
}

interface MenuListProps {
  items: MenuItem[];
}

export function MenuList({ items }: MenuListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [itemToAdd, setItemToAdd] = useState<MenuItem | null>(null);

  const categories = [
    "all",
    ...new Set(items.map((item) => item.category || "Uncategorized")),
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Fetch cart on mount
  useEffect(() => {
    const fetchCart = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;
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
              restaurantId: item.restaurantId,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, []);

  const clearCart = async (userId: string) => {
    console.log("Clearing cart for user:", userId);
    try {
      const response = await fetch(`http://localhost:3001/api/cart/${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }
      setCartItems([]);
      toast({
        title: "Cart Cleared",
        description: "Previous cart items have been removed.",
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to clear cart",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addToCart = async (item: MenuItem) => {
    console.log(
      "Attempting to add item:",
      item.name,
      "from restaurant:",
      item.restaurantId
    );
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    // Check if cart has items from a different restaurant
    const cartRestaurantId =
      cartItems.length > 0 ? cartItems[0].restaurantId : null;
    if (cartRestaurantId && cartRestaurantId !== item.restaurantId) {
      console.log(
        "Cart contains items from different restaurant:",
        cartRestaurantId
      );
      setItemToAdd(item);
      setShowModal(true);
      return;
    }

    await addItemToCart(item, userId);
  };

  const handleModalConfirm = async () => {
    if (!itemToAdd) return;
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    if (!userId) return;

    try {
      await clearCart(userId);
      await addItemToCart(itemToAdd, userId);
      setShowModal(false);
      setItemToAdd(null);
    } catch (error) {
      console.error("Error handling cart replacement:", error);
      setShowModal(false);
    }
  };

  const handleModalCancel = () => {
    console.log("User cancelled adding item from different restaurant");
    setShowModal(false);
    setItemToAdd(null);
  };

  const addItemToCart = async (item: MenuItem, userId: string) => {
    console.log("Adding item to cart:", item.name);
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
        return [
          ...prev,
          { id: item.id, quantity: 1, restaurantId: item.restaurantId },
        ];
      });

      toast({
        title: "Success",
        description: `${item.name} added to cart!`,
      });
    } catch (error) {
      console.error("Add item error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    console.log("Updating quantity for item:", itemId, "to:", newQuantity);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
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
      console.error("Update quantity error:", error);
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

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-md  text-black p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Different Restaurant</h3>
            <p className="text-sm mb-6">
              Your cart contains items from another restaurant. Adding this item
              will clear your current cart. Do you want to proceed?
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                className="text-black border-black hover:bg-slate-500 hover:text-white"
                onClick={handleModalCancel}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={handleModalConfirm}
              >
                Clear Cart & Add
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
