'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import DataTable from '@/components/DataTable';
import BarChart from '@/components/BarChart';
import LineChart from '@/components/LineChart';

export default function AnomalyDetection() {
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

  if (!insights?.anomalies) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <p className="text-gray-600">No anomaly data available. Please upload data first.</p>
      </div>
    );
  }

  const anomalies = insights.anomalies;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Anomaly Detection</h1>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          <strong>Detection Methods:</strong> Z-score analysis and Isolation Forest algorithm
        </p>
      </div>

      {/* Return Spikes */}
      {anomalies.return_spikes && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Return Spikes Detected</h2>
            <p className="text-red-700">
              Number of return spikes: {anomalies.return_spikes.data?.length || 0}
            </p>
          </div>
          {anomalies.return_spikes.data && anomalies.return_spikes.data.length > 0 && (
            <DataTable
              data={anomalies.return_spikes.data || []}
              columns={anomalies.return_spikes.columns || []}
              title="Sudden Spikes in Returns"
            />
          )}
        </div>
      )}

      {/* Conversion Anomalies */}
      {anomalies.conversion_anomalies && (
        <div className="mb-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">⚠️ Conversion Anomalies Detected</h2>
            <p className="text-red-700">
              Number of conversion anomalies: {anomalies.conversion_anomalies.data?.length || 0}
            </p>
          </div>
          {anomalies.conversion_anomalies.data && anomalies.conversion_anomalies.data.length > 0 && (
            <DataTable
              data={anomalies.conversion_anomalies.data || []}
              columns={anomalies.conversion_anomalies.columns || []}
              title="Sudden Drop in Conversions"
            />
          )}
        </div>
      )}

      {/* Suspicious Transactions */}
      {anomalies.suspicious_orders && (
        <div className="mb-8">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-orange-800 mb-2">🔍 Suspicious Transactions</h2>
            <p className="text-orange-700">
              Number of suspicious orders: {anomalies.suspicious_orders.data?.length || 0}
            </p>
          </div>
          {anomalies.suspicious_orders.data && anomalies.suspicious_orders.data.length > 0 && (
            <DataTable
              data={anomalies.suspicious_orders.data || []}
              columns={anomalies.suspicious_orders.columns || []}
              title="Suspicious Transactions (Isolation Forest Detection)"
            />
          )}
        </div>
      )}

      {/* Supplier Delays */}
      {anomalies.supplier_delays && (
        <div className="mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold text-blue-800 mb-2">⏱️ Supplier-Related Delays</h2>
            <p className="text-blue-700">
              Number of delayed orders: {anomalies.supplier_delays.data?.length || 0}
            </p>
          </div>
          {anomalies.supplier_delays.data && anomalies.supplier_delays.data.length > 0 && (
            <DataTable
              data={anomalies.supplier_delays.data || []}
              columns={anomalies.supplier_delays.columns || []}
              title="Supplier-Related Delays"
            />
          )}
        </div>
      )}

      {(!anomalies.return_spikes?.data?.length &&
        !anomalies.conversion_anomalies?.data?.length &&
        !anomalies.suspicious_orders?.data?.length &&
        !anomalies.supplier_delays?.data?.length) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 text-lg font-semibold">
            ✓ No significant anomalies detected. Your data looks healthy!
          </p>
        </div>
      )}
    </div>
  );
}

