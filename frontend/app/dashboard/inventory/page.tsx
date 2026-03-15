'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import DataTable from '@/components/DataTable';

export default function InventoryInsights() {
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

  if (!insights?.inventory_health) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <p className="text-gray-600">No inventory data available. Please upload data first.</p>
      </div>
    );
  }

  const inventory = insights.inventory_health;
  const inventoryData = inventory.data || [];
  const inventoryColumns = inventory.columns || [];

  // Filter alerts
  const overstockItems = inventoryData.filter((row: any[]) => {
    const overstockIdx = inventoryColumns.indexOf('overstock');
    return overstockIdx >= 0 && row[overstockIdx] === true;
  });

  const understockItems = inventoryData.filter((row: any[]) => {
    const understockIdx = inventoryColumns.indexOf('understock');
    return understockIdx >= 0 && row[understockIdx] === true;
  });

  const lowStockItems = inventoryData.filter((row: any[]) => {
    const daysOfStockIdx = inventoryColumns.indexOf('days_of_stock');
    return daysOfStockIdx >= 0 && row[daysOfStockIdx] < 15 && row[daysOfStockIdx] > 0;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Inventory Management Insights</h1>

      {/* Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Under-Stock Alerts</h3>
          <p className="text-3xl font-bold text-red-600">{understockItems.length}</p>
          <p className="text-sm text-red-700 mt-2">Items below safety stock</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚡ Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-yellow-600">{lowStockItems.length}</p>
          <p className="text-sm text-yellow-700 mt-2">Items with less than 15 days of stock</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">📦 Over-Stock Alerts</h3>
          <p className="text-3xl font-bold text-blue-600">{overstockItems.length}</p>
          <p className="text-sm text-blue-700 mt-2">Items exceeding optimal stock levels</p>
        </div>
      </div>

      {/* Under-Stock Items */}
      {understockItems.length > 0 && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-red-800">⚠️ Under-Stock Items (Action Required)</h2>
            <p className="text-red-700">These items are below safety stock levels</p>
          </div>
          <DataTable
            data={understockItems}
            columns={inventoryColumns}
            title="Under-Stock Items"
          />
        </div>
      )}

      {/* Low Stock Items */}
      {lowStockItems.length > 0 && (
        <div className="mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-yellow-800">⚡ Low Stock Items (Monitor Closely)</h2>
            <p className="text-yellow-700">These items have less than 15 days of stock remaining</p>
          </div>
          <DataTable
            data={lowStockItems}
            columns={inventoryColumns}
            title="Low Stock Items"
          />
        </div>
      )}

      {/* Over-Stock Items */}
      {overstockItems.length > 0 && (
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-blue-800">📦 Over-Stock Items</h2>
            <p className="text-blue-700">These items exceed optimal stock levels</p>
          </div>
          <DataTable
            data={overstockItems}
            columns={inventoryColumns}
            title="Over-Stock Items"
          />
        </div>
      )}

      {/* Full Inventory Health Table */}
      <div className="mb-8">
        <DataTable
          data={inventoryData}
          columns={inventoryColumns}
          title="Complete Inventory Health Report (Days of Stock Left, Over-stock / Under-stock Alerts, Refill Quantity Recommendations, Auto Replenishment Suggestions)"
        />
      </div>
    </div>
  );
}

