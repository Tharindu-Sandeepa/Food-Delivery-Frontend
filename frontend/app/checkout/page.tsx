"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import CheckoutFormWithStripe from "@/components/checkout/checkout-form"; // Fixed import (default)
import { CheckoutSummary } from "@/components/checkout/checkout-summary";

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: string;
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

interface DeliveryAddress {
  lat: number;
  lng: number;
  address: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [deliveryAddress, setDeliveryAddress] =
    useState<DeliveryAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");

  // Fetch cart items and restaurant details on mount
  useEffect(() => {
    const fetchCart = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = user.id;
      if (!userId) {
        toast({
          title: "Error",
          description: "Please log in to proceed with checkout.",
          variant: "destructive",
        });
        router.push("/login");
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
        setCartItems(data.items);

        // Fetch restaurant details if cart has items
        if (data.items.length > 0) {
          const restaurantId = data.items[0].restaurantId;
          const restaurantResponse = await fetch(
            `http://localhost:3002/restaurants/${restaurantId}`
          );
          if (!restaurantResponse.ok) {
            throw new Error("Failed to fetch restaurant details");
          }
          const restaurantData = await restaurantResponse.json();
          setRestaurant(restaurantData);
        }
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
  }, [router]);

  const handlePlaceOrder = async (paymentMethodId?: string) => {
    if (!deliveryAddress) {
      toast({
        title: "Error",
        description: "Please select a delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!restaurant) {
      toast({
        title: "Error",
        description: "Restaurant details are missing.",
        variant: "destructive",
      });
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const userId = user.id;
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to place an order.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const deliveryFee = 2.99;
      const tax = subtotal * 0.08;
      const total = subtotal + deliveryFee + tax;

      // Generate a unique orderId
      const orderId = `ORD-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const orderPayload = {
        orderId,
        customerId: userId,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total,
        subTotal: subtotal,
        deliveryFee,
        deliveryAddress: {
          lat: deliveryAddress.lat,
          lng: deliveryAddress.lng,
          address: deliveryAddress.address,
        },
        restaurantLocation: {
          lat: restaurant.location.coordinates[1], // latitude
          lng: restaurant.location.coordinates[0], // longitude
          address: restaurant.address,
        },
        paymentMethod,
        paymentMethodId, // Include for card payments
        status: "pending",
      };

      if (paymentMethod === "card" && paymentMethodId) {
        // Process card payment via backend
        const paymentResponse = await fetch(
          "http://localhost:3001/api/orders/payments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              paymentMethodId,
              amount: total,
              currency: "usd",
            }),
          }
        );

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json();
          throw new Error(errorData.message || "Payment failed");
        }

        const paymentResult = await paymentResponse.json();
        if (paymentResult.status !== "succeeded") {
          throw new Error("Payment did not succeed");
        }
      }

      // Create order
      const orderResponse = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to place order");
      }

      toast({
        title: "Success",
        description: "Order placed successfully!",
      });

      // Clear cart after successful order
      await fetch(`http://localhost:3001/api/cart/${userId}`, {
        method: "DELETE",
      });


      //send email to customer and restaurant
      await fetch("http://localhost:3006/api/v1/notifications/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId, 
          orderId, 
          items: cartItems, 
          total: subtotal, 
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,        
        }),
      });

      // Redirect to orders page
      router.push("/orders");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // If cart is empty, show empty cart message
  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" asChild>
              <a href="/">Browse Restaurants</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">
            Complete your order by providing delivery and payment details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CheckoutFormWithStripe
              onPlaceOrder={handlePlaceOrder}
              isProcessing={isProcessing}
              setDeliveryAddress={setDeliveryAddress}
              setPaymentMethod={setPaymentMethod}
            />
          </div>
          <div>
            <CheckoutSummary items={cartItems} />
          </div>
        </div>
      </div>
    </main>
  );
}
