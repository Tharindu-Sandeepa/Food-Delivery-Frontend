"use client"
import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import customMarkerIcon from "@/public/map.svg" // Your custom marker image

const CustomIcon = L.icon({
  iconUrl: customMarkerIcon.src,
  iconSize: [38, 38], // Adjust size as needed
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
})

L.Marker.prototype.options.icon = CustomIcon


interface MapProps {
  center: [number, number]
  zoom: number
  onClick?: (lat: number, lng: number) => void
  markerPosition?: [number, number] | null
}

export function Map({ center, zoom, onClick, markerPosition }: MapProps) {
  useEffect(() => {
    const map = L.map("map").setView(center, zoom)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    let marker: L.Marker | null = null

    if (markerPosition) {
      marker = L.marker([markerPosition[0], markerPosition[1]]).addTo(map)
    }

    if (onClick) {
      map.on("click", (e) => {
        const { lat, lng } = e.latlng

        if (marker) {
          map.removeLayer(marker)
        }

        marker = L.marker([lat, lng]).addTo(map)
        onClick(lat, lng)
      })
    }

    return () => {
      map.remove()
    }
  }, [center, zoom, onClick, markerPosition])

  return <div id="map" style={{ height: "100%", width: "100%" }} />
}