"use client"
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const driverIcon = L.icon({
  iconUrl: '/images/driver-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

const restaurantIcon = L.icon({
  iconUrl: '/images/restaurant-icon.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
})

interface Location {
  lat: number
  lng: number
}

interface Driver {
  id: string
  name: string
  location: Location
  available: boolean
}

interface Order {
  id: string
  restaurantLocation: Location
  restaurantName: string
}

export default function AssignmentMap() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)

  // Fetch nearby drivers and orders
  useEffect(() => {
    const fetchData = async () => {
      // Get user location
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
          
          // Fetch nearby data
          fetch(`/api/drivers/nearby?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
            .then(res => res.json())
            .then(data => setDrivers(data))
            
          fetch(`/api/orders/pending?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
            .then(res => res.json())
            .then(data => setOrders(data))
        },
        (err) => console.error(err)
      )
    }
    
    fetchData()
    
    // Set up real-time updates
    const eventSource = new EventSource('/api/events')
    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'DRIVER_UPDATE') {
        setDrivers(prev => prev.map(d => d.id === data.driver.id ? data.driver : d))
      }
    }
    
    return () => eventSource.close()
  }, [])

  const handleAssignToMe = async (orderId: string) => {
    if (!userLocation) return
    
    try {
      const response = await fetch('/api/orders/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          driverLocation: userLocation
        })
      })
      
      if (response.ok) {
        alert('Order assigned successfully!')
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error('Assignment failed:', error)
    }
  }

  return (
    <div className="h-screen w-full">
      {userLocation ? (
        <MapContainer 
          center={[userLocation.lat, userLocation.lng]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* User location */}
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your Location</Popup>
          </Marker>
          
          {/* Drivers */}
          {drivers.map(driver => (
            <Marker 
              key={driver.id} 
              position={[driver.location.lat, driver.location.lng]} 
              icon={driverIcon}
            >
              <Popup>
                <div>
                  <h3>{driver.name}</h3>
                  <p>{driver.available ? 'Available' : 'On Delivery'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
          
          {/* Restaurants/Orders */}
          {orders.map(order => (
            <Marker 
              key={order.id} 
              position={[order.restaurantLocation.lat, order.restaurantLocation.lng]} 
              icon={restaurantIcon}
              eventHandlers={{
                click: () => setSelectedOrder(order.id)
              }}
            >
              <Popup>
                <div>
                  <h3>{order.restaurantName}</h3>
                  <p>Order #{order.id.slice(0, 6)}</p>
                  <button 
                    onClick={() => handleAssignToMe(order.id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
                  >
                    Assign to Me
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>Loading your location...</p>
        </div>
      )}
      
      {selectedOrder && (
        <div className="absolute bottom-4 left-4 bg-white p-4 rounded shadow-lg z-[1000]">
          <h3 className="font-bold">Order Selected</h3>
          <button 
            onClick={() => handleAssignToMe(selectedOrder)}
            className="bg-green-500 text-white px-4 py-2 rounded mt-2"
          >
            Confirm Assignment
          </button>
        </div>
      )}
    </div>
  )
}