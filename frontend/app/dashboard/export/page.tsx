'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function ExportReports() {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

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

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!insights) return;

    setExporting(format);
    try {
      const endpoint = format === 'pdf' ? '/api/export/pdf' : '/api/export/excel';
      const response = await axios.post(
        endpoint,
        { insights },
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `business_insights.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

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
        <p className="text-gray-600">No data available. Please upload and analyze data first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Link href="/dashboard" className="text-primary-600 hover:underline mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-4xl font-bold mb-8">Export Reports</h1>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Download Your Analytics Report</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PDF Export */}
            <div className="border-2 border-gray-200 rounded-lg p-6 text-center hover:border-primary-400 transition">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">PDF Report</h3>
              <p className="text-gray-600 text-sm mb-4">
                Download a comprehensive PDF report with all insights and visualizations
              </p>
              <button
                onClick={() => handleExport('pdf')}
                disabled={exporting !== null}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting === 'pdf' ? 'Generating...' : 'Export PDF'}
              </button>
            </div>

            {/* Excel Export */}
            <div className="border-2 border-gray-200 rounded-lg p-6 text-center hover:border-primary-400 transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Excel Export</h3>
              <p className="text-gray-600 text-sm mb-4">
                Download all data tables and insights as an Excel workbook
              </p>
              <button
                onClick={() => handleExport('excel')}
                disabled={exporting !== null}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting === 'excel' ? 'Generating...' : 'Export Excel'}
              </button>
            </div>

            {/* Dashboard Images */}
            <div className="border-2 border-gray-200 rounded-lg p-6 text-center hover:border-primary-400 transition">
              <div className="text-5xl mb-4">🖼️</div>
              <h3 className="text-lg font-semibold mb-2">Dashboard Images</h3>
              <p className="text-gray-600 text-sm mb-4">
                Export charts and visualizations as image files (coming soon)
              </p>
              <button
                disabled
                className="px-6 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> The exported reports include all available analytics including cohort analysis, 
              product insights, customer segmentation, forecasts, anomaly detection, and inventory management data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

