import { driverService, DriverStats } from '@/lib/driver-api';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';


export function useDriverStats(driverId: string) {
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<any[]>([]);
  const [earningsTrend, setEarningsTrend] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllStats = async () => {
    if (!driverId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all stats in parallel
      const [statsData, trendData, heatmapData] = await Promise.all([
        driverService.getDriverStats(driverId),
        driverService.getEarningsTrend(driverId),
        driverService.getDeliveryHeatmap(driverId)
      ]);

      setStats(statsData);
      setRecentDeliveries(statsData.recentDeliveries || []);
      setEarningsTrend(trendData);
      setHeatmapData(heatmapData);
      
    } catch (err) {
      console.error('Error fetching driver stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load driver statistics');
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecentDeliveries = async (limit: number = 5) => {
    if (!driverId) return [];
    
    try {
      const deliveries = await driverService.getRecentDeliveries(driverId, limit);
      setRecentDeliveries(deliveries);
      return deliveries;
    } catch (err) {
      console.error('Error fetching recent deliveries:', err);
      toast.error('Failed to refresh recent deliveries');
      return [];
    }
  };
  
  const fetchEarningsTrend = async (period: 'week' | 'month' | 'year' = 'week') => {
    if (!driverId) return [];
    
    try {
      const trend = await driverService.getEarningsTrend(driverId, period);
      setEarningsTrend(trend);
      return trend;
    } catch (err) {
      console.error('Error fetching earnings trend:', err);
      toast.error('Failed to load earnings trend');
      return [];
    }
  };
  
  const fetchHeatmapData = async (timeFrame: 'day' | 'week' | 'month' = 'week') => {
    if (!driverId) return [];
    
    try {
      const heatmap = await driverService.getDeliveryHeatmap(driverId, timeFrame);
      setHeatmapData(heatmap);
      return heatmap;
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      toast.error('Failed to load delivery heatmap');
      return [];
    }
  };
  
  useEffect(() => {
    if (driverId) {
      fetchAllStats();
    }
  }, [driverId]);
  
  return {
    stats,
    recentDeliveries,
    earningsTrend,
    heatmapData,
    loading,
    error,
    refetchStats: fetchAllStats,
    fetchRecentDeliveries,
    fetchEarningsTrend,
    fetchHeatmapData
  };
}