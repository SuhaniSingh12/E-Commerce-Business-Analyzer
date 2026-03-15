'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import DataTable from '@/components/DataTable';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';

export default function ProductInsights() {
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

  if (!insights) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <p className="text-gray-600">No product data available. Please upload data first.</p>
      </div>
    );
  }

  const productDashboard = insights.product_dashboard || {};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Product-Level Insights</h1>

      {/* Hero vs Zero Dashboard */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Hero vs Zero Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {productDashboard.top && (
            <DataTable
              data={productDashboard.top.data || []}
              columns={productDashboard.top.columns || []}
              title="Top-Performing SKUs"
            />
          )}
          {productDashboard.worst && (
            <DataTable
              data={productDashboard.worst.data || []}
              columns={productDashboard.worst.columns || []}
              title="Worst-Performing SKUs"
            />
          )}
          {productDashboard.dead_stock && (
            <DataTable
              data={productDashboard.dead_stock.data || []}
              columns={productDashboard.dead_stock.columns || []}
              title="Dead Stock Prediction"
            />
          )}
        </div>
      </div>

      {/* Price Elasticity */}
      {insights.price_elasticity && (
        <div className="mb-8">
          <DataTable
            data={insights.price_elasticity.data || []}
            columns={insights.price_elasticity.columns || []}
            title="Price Elasticity Estimation"
          />
        </div>
      )}

      {/* Customer Sentiment */}
      {insights.sentiment && (
        <div className="mb-8">
          <DataTable
            data={insights.sentiment.data || []}
            columns={insights.sentiment.columns || []}
            title="Customer Sentiment for Product Reviews"
          />
        </div>
      )}

      {/* Product Seasonality */}
      {insights.seasonality && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Product Seasonality</h2>
          {insights.seasonality.monthly && (
            <div className="mb-6">
              <DataTable
                data={insights.seasonality.monthly.data || []}
                columns={insights.seasonality.monthly.columns || []}
                title="Monthly Seasonality"
              />
            </div>
          )}
          {insights.seasonality.weekday && (
            <div className="mb-6">
              <DataTable
                data={insights.seasonality.weekday.data || []}
                columns={insights.seasonality.weekday.columns || []}
                title="Day-of-Week Patterns"
              />
            </div>
          )}
          {insights.seasonality.festival && (
            <div className="mb-6">
              <DataTable
                data={insights.seasonality.festival.data || []}
                columns={insights.seasonality.festival.columns || []}
                title="Festival Spikes (Diwali, New Year, etc.)"
              />
            </div>
          )}
        </div>
      )}

      {/* Product Repeat Purchase Rate */}
      {insights.repeat_purchase && (
        <div className="mb-8">
          <DataTable
            data={insights.repeat_purchase.data || []}
            columns={insights.repeat_purchase.columns || []}
            title="Product Repeat Purchase Rate"
          />
        </div>
      )}

      {/* Inventory Velocity */}
      {insights.inventory_velocity && (
        <div className="mb-8">
          <DataTable
            data={insights.inventory_velocity.data || []}
            columns={insights.inventory_velocity.columns || []}
            title="Inventory Velocity (Days to Sell Out, Avg Daily Sales, Hot Product Tags)"
          />
        </div>
      )}

      {/* Product Return Rate */}
      {insights.return_rate && (
        <div className="mb-8">
          <DataTable
            data={insights.return_rate.data || []}
            columns={insights.return_rate.columns || []}
            title="Product Return Rate (Products with Highest Refund/Return Complaints)"
          />
        </div>
      )}

      {/* Add-to-Cart → Purchase Conversion */}
      {insights.conversion_funnel && (
        <div className="mb-8">
          <DataTable
            data={insights.conversion_funnel.data || []}
            columns={insights.conversion_funnel.columns || []}
            title="Add-to-Cart → Purchase Conversion (Per Product Funnel)"
          />
        </div>
      )}

      {/* Cross-Sell Matrix */}
      {insights.cross_sell && (
        <div className="mb-8">
          <DataTable
            data={insights.cross_sell.data || []}
            columns={insights.cross_sell.columns || []}
            title="Cross-Sell Matrix (Customers who bought X also bought Y)"
          />
        </div>
      )}

      {/* Discount Dependency Score */}
      {insights.discount_dependency && (
        <div className="mb-8">
          <DataTable
            data={insights.discount_dependency.data || []}
            columns={insights.discount_dependency.columns || []}
            title="Discount Dependency Score (Products that only sell during discounts vs perform well at full price)"
          />
        </div>
      )}

      {/* Complaint & Quality Issue Detection */}
      {insights.complaints && (
        <div className="mb-8">
          <DataTable
            data={insights.complaints.data || []}
            columns={insights.complaints.columns || []}
            title="Complaint & Quality Issue Detection (Categorized Feedback Reasons)"
          />
        </div>
      )}
    </div>
  );
}

