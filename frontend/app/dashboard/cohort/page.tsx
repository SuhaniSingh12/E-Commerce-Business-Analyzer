'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import DataTable from '@/components/DataTable';
import Heatmap from '@/components/Heatmap';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';

export default function CohortAnalysis() {
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

  if (!insights?.cohort) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <p className="text-gray-600">No cohort data available. Please upload data first.</p>
      </div>
    );
  }

  const cohort = insights.cohort;

  // Prepare retention matrix data
  const retentionData = cohort.retention?.data || [];
  const retentionColumns = cohort.retention?.columns || [];

  // Prepare comparison data
  const comparisons = cohort.comparisons || {};
  const comparisonData = Object.entries(comparisons).map(([key, value]: [string, any]) => {
    const data = value?.data || [];
    const columns = value?.columns || [];
    return { name: key, data, columns };
  });

  // Prepare geographic insights
  const tierRetention = cohort.geo_insights?.tier_retention || {};
  const regionAOV = cohort.geo_insights?.region_aov || { data: [], columns: [] };
  const stateDiscount = cohort.geo_insights?.state_discount || { data: [], columns: [] };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Cohort Analysis</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Repeat Purchase Rate</h3>
          <p className="text-3xl font-bold text-primary-600">
            {(cohort.repeat_rate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Avg Monthly Revenue</h3>
          <p className="text-3xl font-bold text-primary-600">
            ₹{cohort.summary?.avg_monthly_revenue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Cohorts Analyzed</h3>
          <p className="text-3xl font-bold text-primary-600">
            {cohort.cohort_details?.data?.length || 0}
          </p>
        </div>
      </div>

      {/* Retention Matrix */}
      <div className="mb-8">
        <Heatmap
          data={cohort.retention}
          title="Customer Retention Matrix"
          rowLabel="Cohort Month"
          colLabel="Month"
        />
      </div>

      {/* Revenue Matrix */}
      {cohort.revenue && (
        <div className="mb-8">
          <Heatmap
            data={cohort.revenue}
            title="Monthly Revenue per Cohort"
            rowLabel="Cohort Month"
            colLabel="Month"
          />
        </div>
      )}

      {/* Cohort Details */}
      {cohort.cohort_details && (
        <div className="mb-8">
          <DataTable
            data={cohort.cohort_details.data || []}
            columns={cohort.cohort_details.columns || []}
            title="Cohort Details"
          />
        </div>
      )}

      {/* Cohort Comparisons */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Cohort Comparisons</h2>
        {comparisonData.map((comp, idx) => (
          <div key={idx} className="mb-6">
            <DataTable
              data={comp.data}
              columns={comp.columns}
              title={comp.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            />
          </div>
        ))}
      </div>

      {/* Geography-Based Insights */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Geography-Based Cohort Insights</h2>

        {/* Tier Retention */}
        {tierRetention && Object.keys(tierRetention).length > 0 && (
          <div className="mb-6">
            <Heatmap
              data={tierRetention}
              title="Tier-1 vs Tier-2 vs Tier-3 City Retention"
              rowLabel="City Tier"
              colLabel="Month"
            />
          </div>
        )}

        {/* Region AOV */}
        {regionAOV?.data && regionAOV.data.length > 0 && (
          <div className="mb-6">
            <BarChart
              data={regionAOV.data.map((row: any[]) => ({
                region: row[0],
                aov: row[1],
              }))}
              xKey="region"
              yKeys={[{ key: 'aov', name: 'Average Order Value', color: '#0ea5e9' }]}
              title="Region-wise AOV Comparison"
            />
          </div>
        )}

        {/* State Discount Sensitivity */}
        {stateDiscount?.data && stateDiscount.data.length > 0 && (
          <div className="mb-6">
            <BarChart
              data={stateDiscount.data.map((row: any[]) => ({
                state: row[0],
                discountRate: row[1],
              }))}
              xKey="state"
              yKeys={[{ key: 'discountRate', name: 'Avg Discount Rate', color: '#ef4444' }]}
              title="Discount Sensitivity by State"
            />
          </div>
        )}
      </div>
    </div>
  );
}

