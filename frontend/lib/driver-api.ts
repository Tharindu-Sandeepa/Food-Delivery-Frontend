import axios from 'axios';
import { BASE_URL_DELIVERIES } from './constants/Base_url';

const BASE_URL = `${BASE_URL_DELIVERIES}/api`;
const token = localStorage.getItem("token") || "";
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

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
}

export interface DriverStats {
  today: number;
  week: number;
  month: number;
  total: number;
  hourly: { hour: number; earnings: number }[];
  daily: { date: string; earnings: number }[];
  deliveryCount: number;
  avgDeliveryTime: number;
  deliveriesByType: { type: string; count: number }[];
  recentDeliveries: any[];
}

export const driverService = {
  getDriver: async (driverId: string): Promise<Driver> => {
    const response = await axios.get<Driver>(`${BASE_URL}/drivers/${driverId}`);
    return response.data;
  },

  updateDriver: async (driverId: string, data: Partial<Driver>): Promise<Driver> => {
    const response = await axios.put<Driver>(`${BASE_URL}/drivers/${driverId}`, data);
    return response.data;
  },

  getDriverStats: async (driverId: string): Promise<DriverStats> => {
    const response = await axios.get<DriverStats>(`${BASE_URL}/drivers/${driverId}/stats`);
    return response.data;
  },

  getRecentDeliveries: async (driverId: string, limit: number = 5): Promise<any[]> => {
    const response = await axios.get(`${BASE_URL}/drivers/${driverId}/recent-deliveries?limit=${limit}`);
    return response.data;
  },

  getEarningsTrend: async (driverId: string, period: 'week' | 'month' | 'year' = 'week'): Promise<any[]> => {
    const response = await axios.get(`${BASE_URL}/drivers/${driverId}/earnings-trend?period=${period}`);
    return response.data;
  },

  getDeliveryHeatmap: async (driverId: string, timeFrame: 'day' | 'week' | 'month' = 'week'): Promise<any[]> => {
    const response = await axios.get(`${BASE_URL}/drivers/${driverId}/heatmap?timeFrame=${timeFrame}`);
    return response.data;
  }
};