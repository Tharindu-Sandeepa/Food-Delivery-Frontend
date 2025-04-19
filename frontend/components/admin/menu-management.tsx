"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Edit, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  restaurantId: string
  isVegetarian: boolean
  isVegan: boolean
  isAvailable: boolean
}

interface MenuManagementProps {
  restaurantId: string
}

export function MenuManagement({ restaurantId }: MenuManagementProps) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const categories = ["Main Course", "Appetizer", "Dessert", "Beverage", "Side Dish"]

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`http://localhost:3002/restaurants/menu?restaurantId=${restaurantId}`)
        if (!response.ok) throw new Error("Failed to fetch menu items")
        const data = await response.json()
        setItems(data)
      } catch (error) {
        console.error("Error fetching menu items:", error)
        toast.error("Failed to load menu items")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuItems()
  }, [restaurantId])

  const handleSave = async (item: Omit<MenuItem, "_id"> & { _id?: string }) => {
    try {
      setIsLoading(true)
      let response
      let method
      let url

      if (item._id) {
        // Update existing item
        method = "PUT"
        url = `http://localhost:3002/restaurants/menu/${item._id}`
      } else {
        // Add new item
        method = "POST"
        url = "http://localhost:3002/restaurants/menu"
      }

      response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          restaurantId,
        }),
      })

      if (!response.ok) throw new Error(`Failed to ${item._id ? "update" : "create"} menu item`)

      const updatedItem = await response.json()

      if (item._id) {
        setItems((prev) => prev.map((i) => (i._id === item._id ? updatedItem : i)))
      } else {
        setItems((prev) => [...prev, updatedItem])
      }

      toast.success(`Menu item ${item._id ? "updated" : "created"} successfully`)
      setIsDialogOpen(false)
      setEditItem(null)
    } catch (error) {
      console.error("Error saving menu item:", error)
      toast.error(`Failed to ${item._id ? "update" : "create"} menu item`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:3002/restaurants/menu/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete menu item")

      setItems((prev) => prev.filter((item) => item._id !== id))
      toast.success("Menu item deleted successfully")
    } catch (error) {
      console.error("Error deleting menu item:", error)
      toast.error("Failed to delete menu item")
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:3002/restaurants/menu/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      })

      if (!response.ok) throw new Error("Failed to update availability")

      const updatedItem = await response.json()
      setItems((prev) => prev.map((item) => (item._id === id ? updatedItem : item)))
      toast.success("Availability updated successfully")
    } catch (error) {
      console.error("Error updating availability:", error)
      toast.error("Failed to update availability")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && items.length === 0) {
    return <div className="flex justify-center py-8">Loading menu items...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Menu Items</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditItem(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
            </DialogHeader>
            <MenuItemForm
              item={
                editItem || {
                  _id: "",
                  name: "",
                  description: "",
                  price: 0,
                  imageUrl: "",
                  category: "",
                  restaurantId,
                  isVegetarian: false,
                  isVegan: false,
                  isAvailable: true,
                }
              }
              categories={categories}
              onSave={handleSave}
              isLoading={isLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No menu items found. Add your first item!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <Card key={item._id} className={!item.isAvailable ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {item.imageUrl && (
                    <div className="relative w-20 h-20 rounded-md overflow-hidden">
                      <Image
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => handleToggleAvailability(item._id, item.isAvailable)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                    <p className="text-sm">
                      ${(item.price / 100).toFixed(2)} • {item.category}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {item.isVegetarian && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Vegetarian</span>
                      )}
                      {item.isVegan && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Vegan</span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => {
                          setEditItem(item)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

interface MenuItemFormProps {
  item: MenuItem
  categories: string[]
  onSave: (item: Omit<MenuItem, "_id"> & { _id?: string }) => void
  isLoading: boolean
}

function MenuItemForm({ item, categories, onSave, isLoading }: MenuItemFormProps) {
  const [formData, setFormData] = useState<Omit<MenuItem, "_id"> & { _id?: string }>(item)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (in cents) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseInt(e.target.value) || 0 }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL *</Label>
        <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isVegetarian"
            checked={formData.isVegetarian}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVegetarian: checked }))}
          />
          <Label htmlFor="isVegetarian">Vegetarian</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isVegan"
            checked={formData.isVegan}
            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isVegan: checked }))}
          />
          <Label htmlFor="isVegan">Vegan</Label>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isAvailable"
          checked={formData.isAvailable}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isAvailable: checked }))}
        />
        <Label htmlFor="isAvailable">Available</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Item"}
      </Button>
    </form>
  )
}