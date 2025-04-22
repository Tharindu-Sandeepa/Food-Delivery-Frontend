"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface Address {
  lat: number
  lng: number
  address: string
}

interface AssignDriverDialogProps {
  orderId: string
  open: boolean
  onClose: () => void
  onAssignmentComplete: (driver: { driverId: string; driverName: string }) => void
  deliveryAddress?: Address
  startLocation?: Address
  restaurantId?: string
}

export function AssignDriverDialog({
  orderId,
  open,
  onClose,
  onAssignmentComplete
}: AssignDriverDialogProps) {
  const [status, setStatus] = useState<'idle' | 'searching' | 'assigned' | 'error'>('idle')
  const [driver, setDriver] = useState<{ driverId: string; driverName: string } | null>(null)

  useEffect(() => {
    if (!open) {
      setStatus('idle')
      setDriver(null)
    }
  }, [open])

  const assignDriver = async () => {
    setStatus('searching')
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/ready`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Assignment failed')

      const data = await response.json()

      console.log("Driver assignment response:", data)

      if (!data || !data.driverId || !data.driverName) {
        throw new Error("Invalid driver data")
      }

      setDriver(data)
      setStatus('assigned')
      onAssignmentComplete(data)
    } catch (error) {
      console.error("Driver assignment error:", error)
      setStatus('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {status === 'idle' && (
            <div>
              <p>Ready to assign a driver to this order?</p>
              <Button onClick={assignDriver} className="mt-4">
                Find Nearest Driver
              </Button>
            </div>
          )}

          {status === 'searching' && (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="animate-spin h-6 w-6 text-blue-500 mb-2" />
              <p>Searching for available drivers...</p>
            </div>
          )}

          {status === 'assigned' && driver && (
            <div className="text-center py-4">
              <p className="text-green-600 font-semibold">
                Driver assigned successfully!
              </p>
              <p className="mt-2">
                {driver.driverName} is on the way to pick up the order.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4 text-red-600">
              <p>Failed to assign driver. Please try again.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
