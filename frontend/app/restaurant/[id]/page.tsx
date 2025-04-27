"use client"
import { useState, useEffect } from "react"
import { RestaurantHeader } from "@/components/restaurant-header"
import { MenuList } from "@/components/menu-list"
import { Star, X } from "lucide-react"
import { toast } from "sonner"
import { notFound } from "next/navigation"
import React from "react"

interface Location {
  latitude: number
  longitude: number
}

interface Restaurant {
  _id: string
  name: string
  imageUrl?: string | null
  cuisineType: string
  address: string
  location: Location
  isAvailable: boolean
  rating: number
  openingHours?: {
    open: string
    close: string
  }
  deliveryZones: string[]
  createdAt: string
}

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  image: string
  category: string
  restaurantId: string
  isVegetarian?: boolean
  isVegan?: boolean
}

interface Review {
  _id: string
  restaurantId: string
  userId: string
  rating: number
  comment: string
  createdAt: string
}

const getImageSrc = (imageUrl?: string | null): string => {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("/uploads/")) {
    console.warn("Invalid imageUrl detected:", imageUrl)
    return "/placeholder.svg"
  }
  return `http://localhost:3002${imageUrl}`
}

// Mock userId for testing
const MOCK_USER_ID = "680d5112e11b13f755e9egg0" // Budget Kade's userId

// StarRating Component
const StarRating = ({ rating, setRating, readOnly = false }: { rating: number; setRating?: (rating: number) => void; readOnly?: boolean }) => {
  const stars = [1, 2, 3, 4, 5]
  return (
    <div className="flex space-x-1">
      {stars.map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-${readOnly ? 'default' : 'pointer'} transition-colors duration-200 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => !readOnly && setRating && setRating(star)}
        />
      ))}
    </div>
  )
}

// ReviewForm Component
const ReviewForm = ({ restaurantId, userId, onClose, onSubmit }: { restaurantId: string; userId: string; onClose: () => void; onSubmit: () => void }) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }
    if (!comment.trim()) {
      toast.error("Please enter a comment")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`http://localhost:3002/restaurants/${restaurantId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, userId, rating, comment }),
      })
      if (!response.ok) {
        throw new Error("Failed to submit review")
      }
      toast.success("Review submitted successfully")
      setRating(0)
      setComment("")
      onSubmit()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-in fade-in-50 zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add Your Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Share your experience..."
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ReviewList Component
const ReviewList = ({ reviews }: { reviews: Review[] }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Customer Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
      ) : (
        reviews.map((review) => (
          <div
            key={review._id}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <StarRating rating={review.rating} readOnly />
              <span className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))
      )}
    </div>
  )
}

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params) // Unwrap params Promise
  const { id } = resolvedParams
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch restaurant, menu, and reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch restaurant
        const restaurantRes = await fetch(`http://localhost:3002/restaurants/${id}`, {
          cache: "no-store",
        })
        if (!restaurantRes.ok) {
          console.error(`Restaurant fetch failed for ID: ${id}, status: ${restaurantRes.status}`)
          throw new Error("Restaurant not found")
        }
        const restaurantData: Restaurant = await restaurantRes.json()
        setRestaurant(restaurantData)

        // Fetch menu items
        const menuRes = await fetch(`http://localhost:3002/restaurants/menu?restaurantId=${id}`, {
          cache: "no-store",
        })
        if (menuRes.ok) {
          const rawMenuItems = await menuRes.json()
          if (Array.isArray(rawMenuItems)) {
            setMenuItems(
              rawMenuItems.map((item: any) => ({
                id: item._id,
                name: item.name,
                description: item.description || "",
                price: item.price,
                image: getImageSrc(item.imageUrl),
                category: item.category || "Uncategorized",
                restaurantId: item.restaurantId,
                isVegetarian: item.isVegetarian || false,
                isVegan: item.isVegan || false,
              }))
            )
          } else {
            console.error("Menu items response is not an array:", rawMenuItems)
          }
        } else {
          console.error(
            `Menu fetch failed for restaurant ID: ${id}, status: ${menuRes.status}, response:`,
            await menuRes.text()
          )
        }

        // Fetch reviews
        const reviewsRes = await fetch(`http://localhost:3002/restaurants/${id}/reviews`, {
          cache: "no-store",
        })
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json()
          setReviews(reviewsData)
        } else {
          console.error(`Reviews fetch failed for restaurant ID: ${id}, status: ${reviewsRes.status}`)
        }
      } catch (err: any) {
        setError(err.message || "Failed to load restaurant data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleReviewSubmitted = () => {
    // Refetch reviews after submission
    fetch(`http://localhost:3002/restaurants/${id}/reviews`, { cache: "no-store" })
      .then((res) => res.json())
      .then((reviewsData) => setReviews(reviewsData))
      .catch((err) => console.error("Error refetching reviews:", err))
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading restaurant data...
      </div>
    )
  }

  if (error || !restaurant) {
    notFound()
  }

  const validatedRestaurant = {
    id: restaurant._id,
    name: restaurant.name,
    imageUrl: getImageSrc(restaurant.imageUrl),
    cuisine: restaurant.cuisineType,
    rating: restaurant.rating,
    deliveryTime: "30-45", // Placeholder
    address: restaurant.address,
  }

  return (
    <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <RestaurantHeader restaurant={validatedRestaurant} />
        <MenuList items={menuItems} />
        <div className="mt-8">
          {/* Always show Add a Review button for testing with mock userId */}
          <button
            onClick={() => setShowReviewForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Add a Review
          </button>
          {showReviewForm && (
            <ReviewForm
              restaurantId={restaurant._id}
              userId={MOCK_USER_ID}
              onClose={() => setShowReviewForm(false)}
              onSubmit={handleReviewSubmitted}
            />
          )}
          <div className="mt-6">
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>
    </main>
  )
}