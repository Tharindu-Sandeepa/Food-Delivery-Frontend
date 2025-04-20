"use client"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AvailabilityToggle({ driverId }: { driverId: string }) {
  const [available, setAvailable] = useState(true)
  const [loading, setLoading] = useState(false)

  const toggleAvailability = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/drivers/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          driverId,
          available: !available
        })
      })
      
      if (response.ok) {
        setAvailable(!available)
      }
    } catch (error) {
      console.error('Failed to update availability:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={toggleAvailability}
      variant={available ? 'default' : 'secondary'}
      disabled={loading}
    >
      {available ? 'I\'m Available' : 'On Delivery'}
    </Button>
  )
}