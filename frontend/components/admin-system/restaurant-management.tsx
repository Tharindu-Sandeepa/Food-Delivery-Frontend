"use client"
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Trash2, Plus, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import dynamic from "next/dynamic"

// Dynamically import the Map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("@/components/map").then((mod) => mod.Map), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
})

interface Location {
  longitude: number
  latitude: number
}

interface Restaurant {
  _id: string
  name: string
  imageUrl: string
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

interface RestaurantManagementProps {
  restaurants: Restaurant[]
}

export function RestaurantManagement({ restaurants: initialRestaurants }: RestaurantManagementProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [addressSearch, setAddressSearch] = useState("")
  const [mapKey, setMapKey] = useState(0) // Used to force remount of Map component
  const addressInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    cuisineType: "",
    imageUrl: "",
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

  useEffect(() => {
    setRestaurants(initialRestaurants)
  }, [initialRestaurants])

  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisineType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3002/restaurants/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setRestaurants(restaurants.filter(restaurant => restaurant._id !== id))
        toast.success("Restaurant deleted successfully")
      } else {
        throw new Error("Failed to delete restaurant")
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error)
      toast.error("Failed to delete restaurant")
    }
  }

  const handleEdit = (restaurant: Restaurant) => {
    setCurrentRestaurant(restaurant)
    setFormData({
      name: restaurant.name,
      address: restaurant.address,
      cuisineType: restaurant.cuisineType,
      imageUrl: restaurant.imageUrl,
      openingHours: restaurant.openingHours || { open: "09:00", close: "21:00" },
      deliveryZones: restaurant.deliveryZones.join(", "),
      location: restaurant.location,
      isAvailable: restaurant.isAvailable
    })
    setAddressSearch(restaurant.address)
    setMapKey(prev => prev + 1) // Force remount of Map component
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setCurrentRestaurant(null)
    setFormData({
      name: "",
      address: "",
      cuisineType: "",
      imageUrl: "",
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
    setMapKey(prev => prev + 1) // Force remount of Map component
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate location
    if (formData.location.latitude === 0 && formData.location.longitude === 0) {
      toast.error("Please select a location on the map")
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const payload = {
        ...formData,
        deliveryZones: formData.deliveryZones.split(",").map(zone => zone.trim())
      }

      let response
      if (currentRestaurant) {
        // Update existing restaurant
        response = await fetch(`http://localhost:3002/restaurants/${currentRestaurant._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
      } else {
        // Create new restaurant
        response = await fetch('http://localhost:3002/restaurants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
      }

      if (response.ok) {
        const updatedRestaurant = await response.json()
        
        if (currentRestaurant) {
          setRestaurants(restaurants.map(r => 
            r._id === currentRestaurant._id ? updatedRestaurant : r
          ))
        } else {
          setRestaurants([...restaurants, updatedRestaurant])
        }
        
        setIsDialogOpen(false)
        toast.success(`Restaurant ${currentRestaurant ? 'updated' : 'added'} successfully`)
      } else {
        throw new Error(`Failed to ${currentRestaurant ? 'update' : 'add'} restaurant`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error(`Failed to ${currentRestaurant ? 'update' : 'add'} restaurant`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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

  const handleAddressSearch = async () => {
    if (!addressSearch.trim()) return
    
    try {
      // Use a geocoding service (here we're using Nominatim as an example)
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
        toast.success("Location found on map")
      } else {
        toast.warning("No results found for this address")
      }
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast.error("Failed to find location")
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        latitude: lat,
        longitude: lng
      }
    }))
    
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          setFormData(prev => ({
            ...prev,
            address: data.display_name
          }))
          setAddressSearch(data.display_name)
        }
      })
      .catch(err => console.error("Reverse geocoding error:", err))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search restaurants..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Restaurant</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Opening Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRestaurants.length > 0 ? (
                filteredRestaurants.map((restaurant) => (
                  <TableRow key={restaurant._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded overflow-hidden">
                          <Image
                            src={restaurant.imageUrl || "/placeholder.svg"}
                            alt={restaurant.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium">{restaurant.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{restaurant.cuisineType}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {restaurant.openingHours ? 
                        `${restaurant.openingHours.open} - ${restaurant.openingHours.close}` :
                        "Not specified"
                      }
                    </TableCell>
                    <TableCell>
                      {restaurant.isAvailable ? (
                        <span className="text-green-500">Available</span>
                      ) : (
                        <span className="text-red-500">Unavailable</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(restaurant)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(restaurant._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {searchQuery ? "No matching restaurants found" : "No restaurants available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Restaurant Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {currentRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
            </DialogTitle>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL *</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryZones">Delivery Zones (comma separated) *</Label>
                <Input
                  id="deliveryZones"
                  name="deliveryZones"
                  value={formData.deliveryZones}
                  onChange={handleInputChange}
                  required
                />
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
                  center={[
                    formData.location.latitude || 0,
                    formData.location.longitude || 0
                  ]}
                  zoom={formData.location.latitude ? 15 : 2}
                  onClick={handleMapClick}
                  markerPosition={
                    formData.location.latitude && formData.location.longitude ? [
                      formData.location.latitude,
                      formData.location.longitude
                    ] : null
                  }
                />
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
                {isSubmitting ? "Submitting..." : currentRestaurant ? "Update" : "Add"} Restaurant
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}