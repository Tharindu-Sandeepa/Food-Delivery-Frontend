"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Banknote, Loader2, MapPin } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import dynamic from "next/dynamic";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Dynamically import the Map component to avoid SSR issues
const MapWithNoSSR = dynamic(
  () => import("@/components/map").then((mod) => mod.Map),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
);

// Initialize Stripe with your test publishable key
const stripePromise = loadStripe(
  "pk_test_51RIKxMFfm4N1s9LdCUxtHtMvdtclHgfOnimU6VhXKZ8P3rtz4TwTjESobJSiy2cqI5k7pPiysczHeZ39ewJdKJAU00dzCE4TjX"
);

interface DeliveryAddress {
  lat: number;
  lng: number;
  address: string;
}

interface CheckoutFormProps {
  onPlaceOrder: (paymentMethodId?: string) => void; // Updated to accept paymentMethodId
  isProcessing: boolean;
  setDeliveryAddress: (address: DeliveryAddress) => void;
  setPaymentMethod: (method: "cash" | "card") => void;
}

export function CheckoutForm({
  onPlaceOrder,
  isProcessing,
  setDeliveryAddress,
  setPaymentMethod,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setLocalPaymentMethod] = useState<"card" | "cash">(
    "cash"
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    streetAddress: "",
    city: "",
    zipCode: "",
    instructions: "",
  });
  const [addressSearch, setAddressSearch] = useState("");
  const [mapKey, setMapKey] = useState(0);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState(false);

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 0,
    longitude: 0,
  });

  // Update parent payment method
  useEffect(() => {
    setPaymentMethod(paymentMethod);
  }, [paymentMethod, setPaymentMethod]);

  // Update parent delivery address whenever form or location changes
  useEffect(() => {
    const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.zipCode}`;
    if (
      formData.streetAddress &&
      formData.city &&
      formData.zipCode &&
      location.latitude &&
      location.longitude
    ) {
      setDeliveryAddress({
        lat: location.latitude,
        lng: location.longitude,
        address: fullAddress,
      });
    }
  }, [formData, location, setDeliveryAddress]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSearch = async () => {
    if (!addressSearch.trim()) {
      toast({
        title: "Error",
        description: "Please enter an address to search.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addressSearch
        )}`
      );
      if (!response.ok) {
        throw new Error("Failed to geocode address");
      }

      const results = await response.json();
      if (results.length > 0) {
        const firstResult = results[0];
        setLocation({
          latitude: parseFloat(firstResult.lat),
          longitude: parseFloat(firstResult.lon),
        });
        setFormData((prev) => ({
          ...prev,
          streetAddress: firstResult.display_name.split(",")[0] || "",
          city: firstResult.display_name.split(",")[1]?.trim() || "",
        }));
        setAddressSearch(firstResult.display_name);
        setMapKey((prev) => prev + 1);
        toast({
          title: "Success",
          description: "Location found on map.",
        });
      } else {
        toast({
          title: "Warning",
          description: "No results found for this address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find location.",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.display_name) {
          setFormData((prev) => ({
            ...prev,
            streetAddress: data.display_name.split(",")[0] || "",
            city: data.display_name.split(",")[1]?.trim() || "",
          }));
          setAddressSearch(data.display_name);
        }
      })
      .catch((err) => {
        console.error("Reverse geocoding error:", err);
        toast({
          title: "Error",
          description: "Failed to fetch address from map.",
          variant: "destructive",
        });
      });
  };

  const handleCardChange = (event: any) => {
    setIsCardComplete(event.complete);
    setPaymentError(event.error ? event.error.message : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.latitude || !location.longitude) {
      toast({
        title: "Error",
        description: "Please select a delivery location on the map.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "card") {
      if (!stripe || !elements) {
        toast({
          title: "Error",
          description: "Stripe is not initialized.",
          variant: "destructive",
        });
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        toast({
          title: "Error",
          description: "Card details are missing.",
          variant: "destructive",
        });
        return;
      }

      if (!isCardComplete) {
        toast({
          title: "Error",
          description: "Please complete the card details.",
          variant: "destructive",
        });
        return;
      }

      try {
        // Create a payment method token
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
          billing_details: {
            name: formData.name,
            phone: formData.phone,
            address: {
              line1: formData.streetAddress,
              city: formData.city,
              postal_code: formData.zipCode,
            },
          },
        });

        if (error) {
          toast({
            title: "Payment Error",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (paymentMethod) {
          // Pass paymentMethod.id to parent for order creation
          onPlaceOrder(paymentMethod.id);
        }
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to process payment.",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Cash payment, proceed directly
      onPlaceOrder();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address-search">Search Address</Label>
              <div className="flex gap-2">
                <Input
                  ref={addressInputRef}
                  id="address-search"
                  placeholder="Search for an address..."
                  value={addressSearch}
                  onChange={(e) => setAddressSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddressSearch}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <div className="h-64 rounded-md overflow-hidden border relative">
              <MapWithNoSSR
                key={mapKey}
                center={[location.latitude || 0, location.longitude || 0]}
                zoom={location.latitude ? 15 : 2}
                onClick={handleMapClick}
                markerPosition={
                  location.latitude && location.longitude
                    ? [location.latitude, location.longitude]
                    : null
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address</Label>
              <Input
                id="streetAddress"
                name="streetAddress"
                placeholder="123 Main St, Apt 4B"
                value={formData.streetAddress}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="New York"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  placeholder="10001"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">
                Delivery Instructions (Optional)
              </Label>
              <Textarea
                id="instructions"
                name="instructions"
                placeholder="E.g., Ring doorbell, leave at door, call upon arrival..."
                value={formData.instructions}
                onChange={handleChange}
              />
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  name="latitude"
                  type="number"
                  step="0.000001"
                  value={location.latitude}
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  name="longitude"
                  type="number"
                  step="0.000001"
                  value={location.longitude}
                  readOnly
                />
              </div>
            </div> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setLocalPaymentMethod(value as "card" | "cash")
              }
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="cash" id="cash" />
                <Label
                  htmlFor="cash"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Banknote className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Pay with cash when your food arrives
                    </p>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="card" id="card" />
                <Label
                  htmlFor="card"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-muted-foreground">
                      Pay securely with your card
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {paymentMethod === "card" && (
              <div className="mt-4 space-y-4 p-4 border rounded-md bg-muted/50">
                <div className="space-y-2">
                  <Label htmlFor="card-element">Card Details</Label>
                  <div className="p-3 border rounded-md bg-white">
                    <CardElement
                      id="card-element"
                      options={{
                        style: {
                          base: {
                            fontSize: "16px",
                            color: "#000",
                            "::placeholder": {
                              color: "#a0aec0",
                            },
                          },
                          invalid: {
                            color: "#e53e3e",
                          },
                        },
                      }}
                      onChange={handleCardChange}
                    />
                  </div>
                  {paymentError && (
                    <p className="text-sm text-red-500">{paymentError}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={
            isProcessing || (paymentMethod === "card" && !isCardComplete)
          }
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </div>
    </form>
  );
}

// Wrap the component with Stripe provider
import { Elements } from "@stripe/react-stripe-js";

export default function CheckoutFormWithStripe(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
