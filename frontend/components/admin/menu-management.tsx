"use client"

import type React from "react"

import { useState } from "react"
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

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  restaurantId: string
  available?: boolean
}

interface MenuManagementProps {
  items: MenuItem[]
}

export function MenuManagement({ items: initialItems }: MenuManagementProps) {
  const [items, setItems] = useState(initialItems.map((item) => ({ ...item, available: true })))
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const categories = ["Pizza", "Burgers", "Sushi", "Pasta", "Desserts", "Drinks"]

  const handleSave = (item: MenuItem) => {
    if (editItem) {
      // Update existing item
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
    } else {
      // Add new item
      setItems((prev) => [...prev, { ...item, id: Math.random().toString(36).substr(2, 9) }])
    }
    setIsDialogOpen(false)
    setEditItem(null)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleToggleAvailability = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item)))
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
                  id: "",
                  name: "",
                  description: "",
                  price: 0,
                  image: "/placeholder.svg?height=200&width=200",
                  category: "",
                  restaurantId: "1",
                }
              }
              categories={categories}
              onSave={handleSave}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Card key={item.id} className={!item.available ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-md overflow-hidden">
                  <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <Switch checked={item.available} onCheckedChange={() => handleToggleAvailability(item.id)} />
                      <span className="text-xs text-muted-foreground">
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                  <p className="text-sm">
                    ${item.price.toFixed(2)} • {item.category}
                  </p>

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
                      onClick={() => handleDelete(item.id)}
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
    </div>
  )
}

interface MenuItemFormProps {
  item: MenuItem
  categories: string[]
  onSave: (item: MenuItem) => void
}

function MenuItemForm({ item, categories, onSave }: MenuItemFormProps) {
  const [formData, setFormData] = useState(item)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
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
        <Label htmlFor="image">Image URL</Label>
        <Input id="image" name="image" value={formData.image} onChange={handleChange} required />
      </div>

      <Button type="submit" className="w-full">
        Save Item
      </Button>
    </form>
  )
}
