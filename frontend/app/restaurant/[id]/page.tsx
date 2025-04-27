import { RestaurantHeader } from "@/components/restaurant-header";
import { MenuList } from "@/components/menu-list";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Location {
  latitude: number;
  longitude: number;
}

interface Restaurant {
  _id: string;
  name: string;
  imageUrl?: string | null;
  cuisineType: string;
  address: string;
  location: Location;
  isAvailable: boolean;
  rating: number;
  openingHours?: {
    open: string;
    close: string;
  };
  deliveryZones: string[];
  createdAt: string;
}

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

const getImageSrc = (imageUrl?: string | null): string => {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) {
    console.warn("Invalid imageUrl detected:", imageUrl);
    return "/placeholder.svg";
  }
  return `http://localhost:3002${imageUrl}`;
};

export default async function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const restaurantRes = await fetch(`http://localhost:3002/restaurants/${id}`, {
    cache: "no-store",
  });

  if (!restaurantRes.ok) {
    console.error(`Restaurant fetch failed for ID: ${id}, status: ${restaurantRes.status}`);
    notFound();
  }

  const restaurant: Restaurant = await restaurantRes.json();

  const validatedRestaurant = {
    id: restaurant._id,
    name: restaurant.name,
    imageUrl: getImageSrc(restaurant.imageUrl),
    cuisine: restaurant.cuisineType,
    rating: restaurant.rating,
    deliveryTime: "30-45", // Placeholder; calculate from openingHours if needed
    address: restaurant.address,
  };

  const menuUrl = `http://localhost:3002/restaurants/menu?restaurantId=${id}`;
  console.log(`Fetching menu items from: ${menuUrl}`);
  const menuRes = await fetch(menuUrl, {
    cache: "no-store",
  });

  let menuItems: MenuItem[] = [];
  if (menuRes.ok) {
    const rawMenuItems = await menuRes.json();
    if (Array.isArray(rawMenuItems)) {
      menuItems = rawMenuItems.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description || "",
        price: item.price,
        image: getImageSrc(item.imageUrl),
        category: item.category || "Uncategorized",
        restaurantId: item.restaurantId,
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
      }));
    } else {
      console.error("Menu items response is not an array:", rawMenuItems);
    }
  } else {
    console.error(
      `Menu fetch failed for restaurant ID: ${id}, status: ${menuRes.status}, response:`,
      await menuRes.text()
    );
  }

  return (
    <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <RestaurantHeader restaurant={validatedRestaurant} />
        <MenuList items={menuItems} />
      </div>
    </main>
  );
}