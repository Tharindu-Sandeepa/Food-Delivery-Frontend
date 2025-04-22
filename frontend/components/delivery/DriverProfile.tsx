"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/router';

// types/driver.ts
export interface Driver {
    _id: string;
    userId: string;
    name: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    available: boolean;
    currentDelivery?: string;
    vehicleType: string;
    rating: number;
    contactNumber: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  
  export interface DriverStats {
    today: number;
    week: number;
    month: number;
    total: number;
  }
  
  export interface DriverRegistrationData {
    userId: string;
    name: string;
    vehicleType: string;
    contactNumber: string;
  }

const MapWithNoSSR = dynamic(
  () => import('./MapComponent'),
  { ssr: false }
);

interface DriverProfileProps {
  driverId: string;
}

export default function DriverProfile() {
    const driverId = localStorage.getItem('userId') || '';
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DriverStats>({
    today: 0,
    week: 0,
    month: 0,
    total: 0
  });
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (driverId) {
      fetchDriver();
      fetchStats();
      getLocation();
    }
  }, [driverId]);

  const fetchDriver = async () => {
    try {
      const response = await axios.get<Driver>(`http://localhost:3003/api/drivers/${driverId}`);
      setDriver(response.data);
      
      // Set position from driver's location if available
      if (response.data.location?.coordinates) {
        setPosition([
          response.data.location.coordinates[1], // latitude
          response.data.location.coordinates[0]  // longitude
        ]);
      }
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setError(error.response?.data?.error || 'Failed to load driver');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get<DriverStats>(`http://localhost:3003/api/drivers/${driverId}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPosition: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setPosition(newPosition);
          
          if (driver?.available) {
            updateLocation(newPosition);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const updateLocation = async (coordinates: [number, number]) => {
    try {
      await axios.put(`http://localhost:3003/api/drivers/${driverId}`, {
        location: {
          type: 'Point',
          coordinates: [coordinates[1], coordinates[0]] // MongoDB expects [lng, lat]
        }
      });
    } catch (err) {
      console.error('Failed to update location:', err);
    }
  };

  const toggleAvailability = async () => {
    if (!driver) return;
    
    try {
      const newAvailability = !driver.available;
      const response = await axios.put<Driver>(`/api/drivers/${driverId}`, {
        available: newAvailability
      });
      setDriver(response.data);
      
      if (newAvailability && position) {
        updateLocation(position);
      }
    } catch (err) {
      const error = err as AxiosError<{ error?: string }>;
      setError(error.response?.data?.error || 'Failed to update availability');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!driver) return <div>Driver not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Section */}
        <div className="md:w-1/3">
          <div className="bg-gray-100 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">{driver.name}</h2>
            <p className="mb-2"><span className="font-semibold">Contact:</span> {driver.contactNumber}</p>
            <p className="mb-2"><span className="font-semibold">Vehicle:</span> {driver.vehicleType}</p>
            <p className="mb-4"><span className="font-semibold">Rating:</span> {driver.rating}/5</p>
            
            <div className="flex items-center mb-4">
              <span className="font-semibold mr-2">Availability:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={driver.available}
                  onChange={toggleAvailability}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                <span className="ml-2 text-sm font-medium">
                  {driver.available ? 'Available' : 'Unavailable'}
                </span>
              </label>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Earnings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-xl font-bold">${stats.today}</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-xl font-bold">${stats.week}</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">This Month</p>
                <p className="text-xl font-bold">${stats.month}</p>
              </div>
              <div className="bg-white p-3 rounded shadow">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">${stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="md:w-2/3">
          <div className="h-96 bg-gray-200 rounded-lg overflow-hidden">
            {position ? (
              <MapWithNoSSR position={position} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Loading map...</p>
              </div>
            )}
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Current Location</h3>
            {position ? (
              <p>Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}</p>
            ) : (
              <p>Location not available</p>
            )}
            <button 
              onClick={getLocation}
              className="mt-2 bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
            >
              Refresh Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}