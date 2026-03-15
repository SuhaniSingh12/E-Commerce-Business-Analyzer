'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Heatmap from '@/components/Heatmap';
import DataTable from '@/components/DataTable';

export default function StoreHeatmaps() {
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

  if (!insights?.heatmaps) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> No traffic data available. Heatmaps require traffic/visitor data to be present in your dataset.
          </p>
        </div>
      </div>
    );
  }

  const heatmaps = insights.heatmaps;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Store Heatmaps</h1>

      {/* Visitor Heatmap */}
      {heatmaps.visitor_heatmap && (
        <div className="mb-8">
          <Heatmap
            data={heatmaps.visitor_heatmap}
            title="Hourly Visitor Peaks (Weekday × Hour)"
            rowLabel="Weekday"
            colLabel="Hour"
          />
        </div>
      )}

      {/* Conversion Heatmap */}
      {heatmaps.conversion_heatmap && (
        <div className="mb-8">
          <Heatmap
            data={heatmaps.conversion_heatmap}
            title="Conversion Funnel (Weekday × Hour)"
            rowLabel="Weekday"
            colLabel="Hour"
          />
        </div>
      )}

      {/* Engagement Over Time */}
      {heatmaps.engagement && (
        <div className="mb-8">
          <DataTable
            data={heatmaps.engagement.data || []}
            columns={heatmaps.engagement.columns || []}
            title="Engagement Over Time (Hourly Visitor Peaks, Conversion Funnel, Engagement over time)"
          />
        </div>
      )}

      {!heatmaps.visitor_heatmap && !heatmaps.conversion_heatmap && !heatmaps.engagement && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> Heatmap data requires traffic/visitor information. Please ensure your dataset includes traffic data with timestamps and visitor/purchase counts.
          </p>
        </div>
      )}
    </div>
  );
}

