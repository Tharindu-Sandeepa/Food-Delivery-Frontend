"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MapPin, Edit, Trash2, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import { restaurantService, Restaurant, RestaurantFormData } from "@/services/restaurantService"

// Dynamically import the Map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("@/components/map").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
})

const DEFAULT_CENTER: [number, number] = [51.505, -0.09] // Default to London
const DEFAULT_ZOOM = 2

export default function RestaurantOnboardingPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [addressSearch, setAddressSearch] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const addressInputRef = useRef<HTMLInputElement>(null)

  // Initialize formData with email set to empty string initially
  const [formData, setFormData] = useState<RestaurantFormData>({
    name: "",
    email: "",
    address: "",
    cuisineType: "",
    openingHours: {
      open: "09:00",
      close: "21:00"
    },
    deliveryZones: "",
    location: {
      longitude: 0,
      latitude: 0
    },
    isAvailable: true
  })

  // Fetch user email and restaurant data on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Read user data from localStorage
        const storedUser = localStorage.getItem("user")
        console.log("Stored user data:", storedUser)
        const parsedUser = storedUser ? JSON.parse(storedUser) : null
        console.log("Parsed user email:", parsedUser?.email)

        if (!parsedUser?.email) {
          throw new Error("User email not found in local storage")
        }

        // Update formData with the user's email
        setFormData((prevFormData) => ({
          ...prevFormData,
          email: parsedUser.email
        }))

        // Fetch restaurant data using the email
        try {
          const fetchedRestaurant = await restaurantService.getRestaurantByEmail(parsedUser.email)
          console.log("Fetched restaurant:", fetchedRestaurant)
          if (fetchedRestaurant) {
            // Check location validity for logging purposes
            if (
              !fetchedRestaurant.location ||
              typeof fetchedRestaurant.location.latitude !== "number" ||
              typeof fetchedRestaurant.location.longitude !== "number" ||
              !isValidCoordinates(fetchedRestaurant.location.latitude, fetchedRestaurant.location.longitude)
            ) {
              console.warn("Invalid or missing location in restaurant data:", {
                location: fetchedRestaurant.location,
                restaurant: fetchedRestaurant
              })
            }
            setRestaurant(fetchedRestaurant)
          } else {
            console.log("No restaurant found for email:", parsedUser.email)
            setRestaurant(null)
          }
        } catch (err: any) {
          console.error("Error fetching restaurant:", err)
          setError(err.message)
        }
      } catch (err: any) {
        console.error("Error initializing data:", err)
        setError(err.message || "Failed to load user data")
        toast.error(err.message || "Failed to load user data")
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Restaurant name is required"
    }
    if (!formData.cuisineType.trim()) {
      errors.cuisineType = "Cuisine type is required"
    }
    if (!formData.address.trim()) {
      errors.address = "Address is required"
    }
    if (!formData.deliveryZones.trim()) {
      errors.deliveryZones = "Delivery zones are required"
    }
    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      errors.location = "Please select a location on the map"
    }
    if (!restaurant && !imageFile) {
      errors.image = "Image is required for new restaurants"
    }

    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach(error => toast.error(error))
      return false
    }
    return true
  }

  // Reset form to initial state
  const handleReset = () => {
    setFormData({
      ...formData,
      name: "",
      address: "",
      cuisineType: "",
      openingHours: {
        open: "09:00",
        close: "21:00"
      },
      deliveryZones: "",
      location: {
        longitude: 0,
        latitude: 0
      },
      isAvailable: true
    })
    setAddressSearch("")
    setImageFile(null)
    setFormErrors({})
    toast.info("Form has been reset")
  }

  // Populate form for editing
  const handleEdit = () => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        email: restaurant.email,
        address: restaurant.address,
        cuisineType: restaurant.cuisineType,
        openingHours: restaurant.openingHours || { open: "09:00", close: "21:00" },
        deliveryZones: restaurant.deliveryZones.join(", "),
        location: restaurant.location || { latitude: 0, longitude: 0 },
        isAvailable: restaurant.isAvailable
      })
      setAddressSearch(restaurant.address)
      setImageFile(null)
      setFormErrors({})
      setIsDialogOpen(true)
    }
  }

  // Handle form submission (Create/Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let updatedRestaurant: Restaurant
      if (restaurant) {
        updatedRestaurant = await restaurantService.updateRestaurant(restaurant._id, formData, imageFile || undefined)
      } else {
        updatedRestaurant = await restaurantService.createRestaurant(formData, imageFile || undefined)
      }

      setRestaurant(updatedRestaurant)
      setIsDialogOpen(false)
      setFormErrors({})
      toast.success(`Restaurant ${restaurant ? 'updated' : 'registered'} successfully`)
    } catch (error: any) {
      const errorMessage = error.message || `Failed to ${restaurant ? 'update' : 'register'} restaurant`
      if (errorMessage.includes("Email already exists")) {
        toast.error("This email is already associated with a restaurant")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle restaurant deletion
  const handleDelete = async () => {
    if (restaurant) {
      if (!window.confirm("Are you sure you want to delete this restaurant? This action cannot be undone.")) return
      try {
        await restaurantService.deleteRestaurant(restaurant._id)
        setRestaurant(null)
        setFormData({
          ...formData,
          name: "",
          address: "",
          cuisineType: "",
          openingHours: {
            open: "09:00",
            close: "21:00"
          },
          deliveryZones: "",
          location: {
            longitude: 0,
            latitude: 0
          },
          isAvailable: true
        })
        setAddressSearch("")
        setImageFile(null)
        setFormErrors({})
        toast.success("Restaurant deleted successfully")
      } catch (error: any) {
        toast.error(error.message || "Failed to delete restaurant")
      }
    }
  }

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setFormErrors(prev => ({ ...prev, [name]: "" }))
  }

  // Handle opening hours changes
  const handleOpeningHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [name]: value
      }
    }))
  }

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
      setFormErrors(prev => ({ ...prev, image: "" }))
    }
  }

  // Handle address search (geocoding)
  const handleAddressSearch = async () => {
    if (!addressSearch.trim()) {
      toast.warning("Please enter an address to search")
      return
    }

    setIsGeocoding(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}`
      )

      if (!response.ok) throw new Error("Failed to geocode address")

      const results = await response.json()
      if (results.length > 0) {
        const firstResult = results[0]
        setFormData(prev => ({
          ...prev,
          address: firstResult.display_name,
          location: {
            latitude: parseFloat(firstResult.lat),
            longitude: parseFloat(firstResult.lon)
          }
        }))
        setFormErrors(prev => ({ ...prev, address: "", location: "" }))
        toast.success("Location found on map")
      } else {
        toast.warning("No results found for this address")
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast.error("Failed to find location")
    } finally {
      setIsGeocoding(false)
    }
  }

  // Handle map click (reverse geocoding)
  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        latitude: lat,
        longitude: lng
      }
    }))
    setFormErrors(prev => ({ ...prev, location: "" }))

    setIsGeocoding(true)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setFormData(prev => ({
            ...prev,
            address: data.display_name
          }))
          setAddressSearch(data.display_name)
          setFormErrors(prev => ({ ...prev, address: "" }))
        }
      })
      .catch(err => console.error("Reverse geocoding error:", err))
      .finally(() => setIsGeocoding(false))
  }

  // Get image source with validation
  const getImageSrc = (imageUrl?: string | null): string => {
    if (imageUrl === undefined || imageUrl === null || imageUrl === "" || typeof imageUrl !== "string") {
      console.warn("Invalid imageUrl detected:", imageUrl)
      return "/placeholder.svg"
    }
    if (!imageUrl.startsWith("/uploads/")) {
      console.warn("Unexpected imageUrl format:", imageUrl)
      return "/placeholder.svg"
    }
    return `http://localhost:3002${imageUrl}`
  }

  // Validate coordinates for the map
  const isValidCoordinates = (lat: number, lng: number): boolean => {
    return lat !== 0 && lng !== 0 && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading restaurant data...
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    )
  }

  // Onboarding View
  if (!restaurant) {
    const mapCenter: [number, number] = isValidCoordinates(formData.location.latitude, formData.location.longitude)
      ? [formData.location.latitude, formData.location.longitude]
      : DEFAULT_CENTER
    const mapZoom = isValidCoordinates(formData.location.latitude, formData.location.longitude) ? 15 : DEFAULT_ZOOM

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Register Your Restaurant</CardTitle>
            <CardDescription>
              No restaurant is associated with {formData.email}. Please fill out the form below to register your restaurant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cuisineType">Cuisine Type *</Label>
                  <Input
                    id="cuisineType"
                    name="cuisineType"
                    value={formData.cuisineType}
                    onChange={handleInputChange}
                    required
                    className={formErrors.cuisineType ? "border-red-500" : ""}
                  />
                  {formErrors.cuisineType && <p className="text-red-500 text-sm">{formErrors.cuisineType}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image *</Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    required
                    className={formErrors.image ? "border-red-500" : ""}
                  />
                  {formErrors.image && <p className="text-red-500 text-sm">{formErrors.image}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryZones">Delivery Zones (comma separated) *</Label>
                  <Input
                    id="deliveryZones"
                    name="deliveryZones"
                    value={formData.deliveryZones}
                    onChange={handleInputChange}
                    required
                    className={formErrors.deliveryZones ? "border-red-500" : ""}
                  />
                  {formErrors.deliveryZones && <p className="text-red-500 text-sm">{formErrors.deliveryZones}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Opening Hours *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="open" className="text-xs">Open</Label>
                      <Input
                        id="open"
                        name="open"
                        type="time"
                        value={formData.openingHours.open}
                        onChange={handleOpeningHoursChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="close" className="text-xs">Close</Label>
                      <Input
                        id="close"
                        name="close"
                        type="time"
                        value={formData.openingHours.close}
                        onChange={handleOpeningHoursChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isAvailable"
                      checked={formData.isAvailable}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, isAvailable: checked }))
                      }
                    />
                    <Label htmlFor="isAvailable">
                      {formData.isAvailable ? "Available" : "Unavailable"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Location *</Label>
                  <div className="flex gap-2">
                    <Input
                      ref={addressInputRef}
                      id="address-search"
                      placeholder="Search for an address..."
                      value={addressSearch}
                      onChange={(e) => setAddressSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                      className={formErrors.address ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddressSearch}
                      disabled={isGeocoding}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {isGeocoding ? "Searching..." : "Search"}
                    </Button>
                  </div>
                  {formErrors.address && <p className="text-red-500 text-sm">{formErrors.address}</p>}
                </div>

                <div className="h-64 rounded-md overflow-hidden border relative">
                  <MapWithNoSSR
                    center={mapCenter}
                    zoom={mapZoom}
                    onClick={handleMapClick}
                    markerPosition={
                      isValidCoordinates(formData.location.latitude, formData.location.longitude)
                        ? [formData.location.latitude, formData.location.longitude]
                        : null
                    }
                  />
                  {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.location.latitude}
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
                      value={formData.location.longitude}
                      readOnly
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className={formErrors.address ? "border-red-500" : ""}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Register Restaurant"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Profile View
  const mapCenter: [number, number] = restaurant.location && isValidCoordinates(restaurant.location.latitude, restaurant.location.longitude)
    ? [restaurant.location.latitude, restaurant.location.longitude]
    : DEFAULT_CENTER
  const mapZoom = restaurant.location && isValidCoordinates(restaurant.location.latitude, restaurant.location.longitude) ? 15 : DEFAULT_ZOOM

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{restaurant.name} Profile</CardTitle>
          <CardDescription>Manage your restaurant details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {restaurant.imageUrl && (
              <div className="relative w-24 h-24 rounded-md overflow-hidden">
                <Image
                  src={getImageSrc(restaurant.imageUrl)}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold">{restaurant.name}</h2>
              <p className="text-muted-foreground">{restaurant.cuisineType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <p>{restaurant.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Address</Label>
              <p className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {restaurant.address}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Opening Hours</Label>
              <p>
                {restaurant.openingHours
                  ? `${restaurant.openingHours.open} - ${restaurant.openingHours.close}`
                  : "Not specified"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Delivery Zones</Label>
              <p>{restaurant.deliveryZones.join(", ")}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Availability</Label>
              <p className={restaurant.isAvailable ? "text-green-500" : "text-red-500"}>
                {restaurant.isAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <p>{restaurant.rating.toFixed(1)} / 5</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Restaurant
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Restaurant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={formErrors.name ? "border-red-500" : ""}
                />
                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisineType">Cuisine Type *</Label>
                <Input
                  id="cuisineType"
                  name="cuisineType"
                  value={formData.cuisineType}
                  onChange={handleInputChange}
                  required
                  className={formErrors.cuisineType ? "border-red-500" : ""}
                />
                {formErrors.cuisineType && <p className="text-red-500 text-sm">{formErrors.cuisineType}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleImageChange}
                  className={formErrors.image ? "border-red-500" : ""}
                />
                {formErrors.image && <p className="text-red-500 text-sm">{formErrors.image}</p>}
                {restaurant && restaurant.imageUrl && (
                  <div className="mt-2">
                    <Label>Current Image:</Label>
                    <div className="h-20 w-20 relative">
                      <Image
                        src={getImageSrc(restaurant.imageUrl)}
                        alt="Current restaurant"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryZones">Delivery Zones (comma separated) *</Label>
                <Input
                  id="deliveryZones"
                  name="deliveryZones"
                  value={formData.deliveryZones}
                  onChange={handleInputChange}
                  required
                  className={formErrors.deliveryZones ? "border-red-500" : ""}
                />
                {formErrors.deliveryZones && <p className="text-red-500 text-sm">{formErrors.deliveryZones}</p>}
              </div>
              <div className="space-y-2">
                <Label>Opening Hours *</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="open" className="text-xs">Open</Label>
                    <Input
                      id="open"
                      name="open"
                      type="time"
                      value={formData.openingHours.open}
                      onChange={handleOpeningHoursChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="close" className="text-xs">Close</Label>
                    <Input
                      id="close"
                      name="close"
                      type="time"
                      value={formData.openingHours.close}
                      onChange={handleOpeningHoursChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, isAvailable: checked }))
                    }
                  />
                  <Label htmlFor="isAvailable">
                    {formData.isAvailable ? "Available" : "Unavailable"}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Location *</Label>
                <div className="flex gap-2">
                  <Input
                    ref={addressInputRef}
                    id="address-search"
                    placeholder="Search for an address..."
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
                    className={formErrors.address ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddressSearch}
                    disabled={isGeocoding}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isGeocoding ? "Searching..." : "Search"}
                  </Button>
                </div>
                {formErrors.address && <p className="text-red-500 text-sm">{formErrors.address}</p>}
              </div>

              <div className="h-64 rounded-md overflow-hidden border relative">
                <MapWithNoSSR
                  center={
                    isValidCoordinates(formData.location.latitude, formData.location.longitude)
                      ? [formData.location.latitude, formData.location.longitude]
                      : DEFAULT_CENTER
                  }
                  zoom={
                    isValidCoordinates(formData.location.latitude, formData.location.longitude)
                      ? 15
                      : DEFAULT_ZOOM
                  }
                  onClick={handleMapClick}
                  markerPosition={
                    isValidCoordinates(formData.location.latitude, formData.location.longitude)
                      ? [formData.location.latitude, formData.location.longitude]
                      : null
                  }
                />
                {formErrors.location && <p className="text-red-500 text-sm mt-1">{formErrors.location}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="0.000001"
                    value={formData.location.latitude}
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
                    value={formData.location.longitude}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="address">Full Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  className={formErrors.address ? "border-red-500" : ""}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Update Restaurant"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}