"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function CartSummary() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);

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
      const response = await fetch(`http://localhost:3001/api/cart/${userId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }
      const data = await response.json();
      setItems(data.items);
      const calculatedSubtotal = data.items.reduce(
        (sum: number, item: CartItem) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(calculatedSubtotal);
      console.log("Cart fetched in CartSummary:", data.items);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCart();

    const handleCartUpdate = () => {
      console.log("Received cartUpdated event in CartSummary");
      fetchCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const deliveryFee = 2.99;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  const handleCheckout = () => {
    setIsProcessing(true);
    router.push("/checkout");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Delivery Fee</span>
          <span>${deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium pt-4 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleCheckout}
          disabled={items.length === 0 || isProcessing}
        >
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
