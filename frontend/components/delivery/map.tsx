"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Polyline } from "react-leaflet"
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker"
import L from "leaflet"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import "leaflet/dist/leaflet.css"

const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -30]
})

interface DeliveryMapProps {
  order: {
    id: string
    restaurantName: string
    restaurantAddress?: string
    deliveryAddress: string
    status: string
    items: any[]
    startLocation?: { lat: number, lng: number }
    endLocation?: { lat: number, lng: number }
  }
}

export function DeliveryMap({ order }: DeliveryMapProps) {
  const [route, setRoute] = useState<[number, number][]>([])
  const [pos, setPos] = useState<[number, number]>([0, 0])
  const [prev, setPrev] = useState<[number, number]>([0, 0])
  const [index, setIndex] = useState(0)
  const [delivered, setDelivered] = useState(false)

  useEffect(() => {
    const start = order.startLocation || { lat: 6.9271, lng: 79.8612 }
    const end = order.endLocation || { lat: 6.9281, lng: 79.8622 }
    const points = generateMockRoute(start, end, 20)
    setRoute(points)
    setPos(points[0])
    setPrev(points[0])
  }, [order])

  useEffect(() => {
    const interval = setInterval(() => {
      if (index < route.length - 1) {
        const next = route[index + 1]
        setPrev(pos)
        setPos(next)
        setIndex((i) => i + 1)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [index, pos, route])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Live Delivery Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <MapContainer
              center={pos}
              zoom={17}
              scrollWheelZoom
              style={{ height: "400px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Polyline positions={route} color="blue" />
              <LeafletTrackingMarker
                icon={icon}
                position={pos}
                previousPosition={prev}
                duration={1000}
                keepAtCenter
              />
            </MapContainer>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Restaurant: {order.restaurantName}</p>
            <p className="text-sm">Pickup: {order.restaurantAddress}</p>
            <p className="text-sm">Drop: {order.deliveryAddress}</p>
            <Button onClick={() => setDelivered(true)} disabled={delivered} className="w-full">
              {delivered ? "Delivered ✅" : "Mark as Delivered"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function generateMockRoute(start: { lat: number, lng: number }, end: { lat: number, lng: number }, steps = 20): [number, number][] {
  const points: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const lat = start.lat + (end.lat - start.lat) * (i / steps)
    const lng = start.lng + (end.lng - start.lng) * (i / steps)
    points.push([lat, lng])
  }
  return points
}
