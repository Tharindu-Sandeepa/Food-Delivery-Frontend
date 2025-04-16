"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, MoreHorizontal, CheckCircle, Ban, Eye } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  image: string
  cuisine: string
  rating: number
  status?: "active" | "blocked"
  owner?: {
    id: string
    name: string
    email: string
  }
}

interface PendingRestaurant {
  id: string
  name: string
  cuisine: string
  address: string
  owner: {
    id: string
    name: string
    email: string
  }
  status: "pending" | "approved" | "rejected"
  submittedAt: string
}

interface RestaurantManagementProps {
  restaurants: Restaurant[]
  pendingRestaurants: PendingRestaurant[]
}

export function RestaurantManagement({
  restaurants: initialRestaurants,
  pendingRestaurants: initialPendingRestaurants,
}: RestaurantManagementProps) {
  const [restaurants, setRestaurants] = useState(
    initialRestaurants.map((r) => ({
      ...r,
      status: r.status || "active",
    })),
  )
  const [pendingRestaurants, setPendingRestaurants] = useState(initialPendingRestaurants)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [selectedPendingRestaurant, setSelectedPendingRestaurant] = useState<PendingRestaurant | null>(null)
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Filter restaurants based on search
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredPendingRestaurants = pendingRestaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleStatusChange = (restaurantId: string, status: "active" | "blocked") => {
    setRestaurants((prev) =>
      prev.map((restaurant) => (restaurant.id === restaurantId ? { ...restaurant, status } : restaurant)),
    )
    setIsBlockDialogOpen(false)
  }

  const handleApproveRestaurant = (restaurantId: string) => {
    // Update pending restaurant status
    setPendingRestaurants((prev) =>
      prev.map((restaurant) => (restaurant.id === restaurantId ? { ...restaurant, status: "approved" } : restaurant)),
    )

    // Find the approved restaurant
    const approvedRestaurant = pendingRestaurants.find((r) => r.id === restaurantId)

    if (approvedRestaurant) {
      // Add to active restaurants
      setRestaurants((prev) => [
        ...prev,
        {
          id: approvedRestaurant.id,
          name: approvedRestaurant.name,
          image: "/placeholder.svg?height=300&width=500", // Default image
          cuisine: approvedRestaurant.cuisine,
          rating: 0, // New restaurant starts with 0 rating
          status: "active",
          owner: approvedRestaurant.owner,
        },
      ])
    }

    setIsReviewDialogOpen(false)
  }

  const handleRejectRestaurant = (restaurantId: string) => {
    setPendingRestaurants((prev) =>
      prev.map((restaurant) => (restaurant.id === restaurantId ? { ...restaurant, status: "rejected" } : restaurant)),
    )
    setIsReviewDialogOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            Pending
          </Badge>
        )
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
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
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Restaurants</TabsTrigger>
          <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRestaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 relative rounded overflow-hidden">
                            <Image
                              src={restaurant.image || "/placeholder.svg"}
                              alt={restaurant.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{restaurant.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{restaurant.cuisine}</TableCell>
                      <TableCell>{restaurant.rating}</TableCell>
                      <TableCell>{getStatusBadge(restaurant.status || "active")}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedRestaurant(restaurant)
                                setIsDetailsDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {restaurant.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRestaurant(restaurant)
                                  setIsBlockDialogOpen(true)
                                }}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Block Restaurant
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleStatusChange(restaurant.id, "active")}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Unblock Restaurant
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPendingRestaurants.map((restaurant) => (
                    <TableRow key={restaurant.id}>
                      <TableCell className="font-medium">{restaurant.name}</TableCell>
                      <TableCell>{restaurant.cuisine}</TableCell>
                      <TableCell>{restaurant.owner.name}</TableCell>
                      <TableCell>{getStatusBadge(restaurant.status)}</TableCell>
                      <TableCell>{new Date(restaurant.submittedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPendingRestaurant(restaurant)
                                setIsReviewDialogOpen(true)
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Review Application
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Block Restaurant Dialog */}
      <Dialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Restaurant</DialogTitle>
            <DialogDescription>
              Are you sure you want to block {selectedRestaurant?.name}? This will prevent them from accepting orders.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRestaurant) {
                  handleStatusChange(selectedRestaurant.id, "blocked")
                }
              }}
            >
              Block Restaurant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Restaurant Application Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Restaurant Application</DialogTitle>
            <DialogDescription>Review the application for {selectedPendingRestaurant?.name}</DialogDescription>
          </DialogHeader>

          {selectedPendingRestaurant && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Restaurant Name</p>
                  <p className="text-sm text-muted-foreground">{selectedPendingRestaurant.name}</p>
                </div>
                <div>
                  <p className="font-medium">Cuisine</p>
                  <p className="text-sm text-muted-foreground">{selectedPendingRestaurant.cuisine}</p>
                </div>
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{selectedPendingRestaurant.address}</p>
                </div>
                <div>
                  <p className="font-medium">Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedPendingRestaurant.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium">Owner Information</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPendingRestaurant.owner.name} ({selectedPendingRestaurant.owner.email})
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedPendingRestaurant) {
                  handleRejectRestaurant(selectedPendingRestaurant.id)
                }
              }}
            >
              Reject
            </Button>
            <Button
              onClick={() => {
                if (selectedPendingRestaurant) {
                  handleApproveRestaurant(selectedPendingRestaurant.id)
                }
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restaurant Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurant Details</DialogTitle>
          </DialogHeader>

          {selectedRestaurant && (
            <div className="space-y-4 py-4">
              <div className="relative h-40 w-full rounded-md overflow-hidden">
                <Image
                  src={selectedRestaurant.image || "/placeholder.svg"}
                  alt={selectedRestaurant.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Restaurant Name</p>
                  <p className="text-sm text-muted-foreground">{selectedRestaurant.name}</p>
                </div>
                <div>
                  <p className="font-medium">Cuisine</p>
                  <p className="text-sm text-muted-foreground">{selectedRestaurant.cuisine}</p>
                </div>
                <div>
                  <p className="font-medium">Rating</p>
                  <p className="text-sm text-muted-foreground">{selectedRestaurant.rating}</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRestaurant.status?.charAt(0).toUpperCase() + selectedRestaurant.status?.slice(1) ||
                      "Active"}
                  </p>
                </div>
              </div>

              {selectedRestaurant.owner && (
                <div>
                  <p className="font-medium">Owner Information</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedRestaurant.owner.name} ({selectedRestaurant.owner.email})
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
