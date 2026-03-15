'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import LineChart from '@/components/LineChart';
import DataTable from '@/components/DataTable';

export default function DemandForecasting() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.post('/api/analyze');
        if (response.data.success) {
          setInsights(response.data.insights);
        }
      } catch (err) {
        console.error('Failed to fetch insights:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!insights?.forecast) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <p className="text-gray-600">No forecast data available. Please upload data first.</p>
      </div>
    );
  }

  const forecast = insights.forecast;

  // Combine history and forecast for revenue
  const revenueHistory = forecast.history?.data || [];
  const revenueForecast = forecast.forecast_revenue?.data || [];
  const revenueCombined = [
    ...revenueHistory.map((row: any[]) => {
      const dateIdx = forecast.history?.columns?.indexOf('date') ?? -1;
      const revenueIdx = forecast.history?.columns?.indexOf('revenue') ?? -1;
      return {
        date: row[dateIdx],
        revenue: row[revenueIdx],
        type: 'History',
      };
    }),
    ...revenueForecast.map((row: any[]) => {
      const dateIdx = forecast.forecast_revenue?.columns?.indexOf('date') ?? -1;
      const revenueIdx = forecast.forecast_revenue?.columns?.indexOf('revenue') ?? -1;
      return {
        date: row[dateIdx],
        revenue: row[revenueIdx],
        type: 'Forecast',
      };
    }),
  ];

  // Combine history and forecast for quantity
  const quantityForecast = forecast.forecast_quantity?.data || [];
  const quantityCombined = [
    ...revenueHistory.map((row: any[]) => {
      const dateIdx = forecast.history?.columns?.indexOf('date') ?? -1;
      const quantityIdx = forecast.history?.columns?.indexOf('quantity') ?? -1;
      return {
        date: row[dateIdx],
        quantity: row[quantityIdx],
        type: 'History',
      };
    }),
    ...quantityForecast.map((row: any[]) => {
      const dateIdx = forecast.forecast_quantity?.columns?.indexOf('date') ?? -1;
      const quantityIdx = forecast.forecast_quantity?.columns?.indexOf('quantity') ?? -1;
      return {
        date: row[dateIdx],
        quantity: row[quantityIdx],
        type: 'Forecast',
      };
    }),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Demand Forecasting</h1>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">
          <strong>Forecast Model:</strong> Linear regression with seasonal patterns (monthly seasonality)
        </p>
      </div>

      {/* Monthly Revenue Forecast */}
      <div className="mb-8">
        <LineChart
          data={revenueCombined}
          xKey="date"
          yKeys={[
            { key: 'revenue', name: 'Revenue', color: '#0ea5e9' },
          ]}
          title="Monthly Revenue Forecast (History + Predictions)"
        />
      </div>

      {/* Monthly Quantity Forecast */}
      <div className="mb-8">
        <LineChart
          data={quantityCombined}
          xKey="date"
          yKeys={[
            { key: 'quantity', name: 'Quantity', color: '#10b981' },
          ]}
          title="Monthly Quantity Forecast (History + Predictions)"
        />
      </div>

      {/* Forecast Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {forecast.forecast_revenue && (
          <DataTable
            data={forecast.forecast_revenue.data || []}
            columns={forecast.forecast_revenue.columns || []}
            title="Revenue Forecast Details"
          />
        )}
        {forecast.forecast_quantity && (
          <DataTable
            data={forecast.forecast_quantity.data || []}
            columns={forecast.forecast_quantity.columns || []}
            title="Quantity Forecast Details"
          />
        )}
      </div>

      {/* Historical Data */}
      {forecast.history && (
        <div className="mb-8">
          <DataTable
            data={forecast.history.data || []}
            columns={forecast.history.columns || []}
            title="Historical Monthly Data"
          />
        </div>
      )}
    </div>
  );
}

