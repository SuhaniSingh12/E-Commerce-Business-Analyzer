'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import axios from 'axios';
import FileUpload from '@/components/FileUpload';
import DataTable from '@/components/DataTable';

interface Insights {
  cohort?: any;
  product_dashboard?: any;
  rfm_table?: any;
  forecast?: any;
  anomalies?: any;
  inventory_health?: any;
  heatmaps?: any;
  [key: string]: any;
}

export default function Dashboard() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setInsights(response.data.insights);
        setActiveSection('overview');
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDemoClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/analyze');

      if (response.data.success) {
        setInsights(response.data.insights);
        setActiveSection('overview');
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to analyze data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'cohort', label: 'Cohort Analysis', icon: '🧊' },
    { id: 'product', label: 'Product Insights', icon: '📦' },
    { id: 'rfm', label: 'Customer Segmentation', icon: '👥' },
    { id: 'forecast', label: 'Forecasts', icon: '📈' },
    { id: 'anomaly', label: 'Anomaly Detection', icon: '⚠️' },
    { id: 'inventory', label: 'Inventory Insights', icon: '📋' },
    { id: 'heatmaps', label: 'Heatmaps', icon: '🔥' },
    { id: 'export', label: 'Export Reports', icon: '💾' },
  ];

  if (!insights) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                InsightFlow
              </Link>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upload Your Data
            </h1>
            <p className="text-xl text-gray-600">
              Get started by uploading your sales data or try our demo dataset
            </p>
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <strong>Error:</strong> {error}
            </div>
          )}

          <FileUpload
            onFileUpload={handleFileUpload}
            onDemoClick={handleDemoClick}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              InsightFlow
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setInsights(null);
                  setActiveSection(null);
                }}
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Upload New Data
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-lg min-h-screen p-4">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeSection === item.id
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeSection === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-2">📊 Analytics Ready</h3>
                  <p className="text-gray-600">Your data has been analyzed successfully</p>
                </div>
                {insights.cohort && (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Repeat Purchase Rate</h3>
                    <p className="text-3xl font-bold text-primary-600">
                      {(insights.cohort.repeat_rate * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
                {insights.rfm_table && (
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2">Customer Segments</h3>
                    <p className="text-gray-600">RFM analysis completed</p>
                  </div>
                )}
              </div>
              <p className="text-gray-600">
                Select a section from the sidebar to explore detailed insights.
              </p>
            </div>
          )}

          {activeSection === 'cohort' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Cohort Analysis</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/cohort" className="text-primary-600 underline">detailed cohort analysis</Link>
              </p>
            </div>
          )}

          {activeSection === 'product' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Product Insights</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/product" className="text-primary-600 underline">detailed product insights</Link>
              </p>
            </div>
          )}

          {activeSection === 'rfm' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Customer Segmentation (RFM)</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/rfm" className="text-primary-600 underline">detailed RFM analysis</Link>
              </p>
            </div>
          )}

          {activeSection === 'forecast' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Demand Forecasting</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/forecast" className="text-primary-600 underline">detailed forecasts</Link>
              </p>
            </div>
          )}

          {activeSection === 'anomaly' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Anomaly Detection</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/anomaly" className="text-primary-600 underline">detailed anomaly detection</Link>
              </p>
            </div>
          )}

          {activeSection === 'inventory' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Inventory Insights</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/inventory" className="text-primary-600 underline">detailed inventory insights</Link>
              </p>
            </div>
          )}

          {activeSection === 'heatmaps' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Store Heatmaps</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/heatmaps" className="text-primary-600 underline">detailed heatmaps</Link>
              </p>
            </div>
          )}

          {activeSection === 'export' && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Export Reports</h2>
              <p className="text-gray-600 mb-4">
                Navigate to <Link href="/dashboard/export" className="text-primary-600 underline">export options</Link>
              </p>
            </div>
          )}

          {!activeSection && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
              <p className="text-gray-600">Select a section from the sidebar to begin exploring insights.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

