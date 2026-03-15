'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import DataTable from '@/components/DataTable';
import BarChart from '@/components/BarChart';

export default function RFMAnalysis() {
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

  if (!insights?.rfm_table) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <p className="text-gray-600">No RFM data available. Please upload data first.</p>
      </div>
    );
  }

  const rfmTable = insights.rfm_table;
  const rfmSummary = insights.rfm_summary || {};

  // Prepare segment summary
  const segments = ['Champions', 'Loyal', 'Big Spenders', 'At Risk', 'Lost', 'Need Nurturing'];
  const segmentCounts = segments.map(seg => {
    const count = rfmTable.data?.filter((row: any[]) => 
      rfmTable.columns && row[rfmTable.columns.indexOf('segment')] === seg
    ).length || 0;
    return { segment: seg, count };
  }).filter(s => s.count > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Customer Segmentation (RFM Model)</h1>

      {/* Segment Summary */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Customer Segments</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {segmentCounts.map((seg) => (
            <div key={seg.segment} className="bg-white p-4 rounded-lg shadow-md text-center">
              <h3 className="text-lg font-semibold mb-2">{seg.segment}</h3>
              <p className="text-2xl font-bold text-primary-600">{seg.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RFM Table */}
      <div className="mb-8">
        <DataTable
          data={rfmTable.data || []}
          columns={rfmTable.columns || []}
          title="RFM Segmentation Table"
        />
      </div>

      {/* City-wise Distribution */}
      {rfmSummary.city_distribution && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">City-wise Distribution</h2>
          {rfmSummary.city_distribution.data && rfmSummary.city_distribution.data.length > 0 && (
            <BarChart
              data={rfmSummary.city_distribution.data.map((row: any[]) => ({
                city: row[0],
                customers: row[1],
              }))}
              xKey="city"
              yKeys={[{ key: 'customers', name: 'Number of Customers', color: '#0ea5e9' }]}
              title="Customer Distribution by City"
            />
          )}
        </div>
      )}

      {/* Segment-level LTV */}
      {rfmSummary.segment_ltv && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Segment-level Lifetime Value (LTV)</h2>
          {rfmSummary.segment_ltv.data && rfmSummary.segment_ltv.data.length > 0 && (
            <BarChart
              data={rfmSummary.segment_ltv.data.map((row: any[]) => ({
                segment: row[0],
                ltv: row[1],
              }))}
              xKey="segment"
              yKeys={[{ key: 'ltv', name: 'Average LTV', color: '#10b981' }]}
              title="Average Lifetime Value by Segment"
            />
          )}
        </div>
      )}
    </div>
  );
}

