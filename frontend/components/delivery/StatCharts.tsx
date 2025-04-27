"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface ChartProps {
  data: any[];
  type: 'hourly' | 'daily' | 'deliveryTypes';
  timeRange: 'today' | 'week' | 'month' | 'all';
}

export default function StatCharts({ data, type, timeRange }: ChartProps) {
  // Colors for charts
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
  
  // Format data based on chart type
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Apply time range filtering if needed
    let filteredData = [...data];
    
    // Additional formatting based on chart type
    switch (type) {
      case 'hourly':
        return filteredData.map(item => ({
          ...item,
          hour: `${item.hour}:00`,
        }));
      
      case 'daily':
        return filteredData;
      
      case 'deliveryTypes':
        return filteredData;
      
      default:
        return filteredData;
    }
  }, [data, type, timeRange]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No data available
      </div>
    );
  }

  // Render appropriate chart based on type
  switch (type) {
    case 'hourly':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toString().padStart(2, '0') + 'h'}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `Rs ${value}`}
            />
            <Tooltip 
              formatter={(value) => [`RS ${Number(value).toFixed(2)}`, 'Earnings']}
              labelFormatter={(label) => `Hour: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
      
    case 'daily':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `Rs ${value}`}
            />
            <Tooltip 
              formatter={(value) => [`Rs ${Number(value).toFixed(2)}`, 'Earnings']}
            />
            <Bar 
              dataKey="earnings" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
      
    case 'deliveryTypes':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              nameKey="type"
              label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value, 'Deliveries']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
      
    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Select a chart type to view data
        </div>
      );
  }
}