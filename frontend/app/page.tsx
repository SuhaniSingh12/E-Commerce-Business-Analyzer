'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">InsightFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="px-4 py-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Your Raw Data Into Smart Decisions
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto text-center">
            Upload your sales data. Get predictions, insights, cohorts & profit-boosting analytics in minutes. No coding required. Enterprise-grade analytics for businesses of all sizes.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-lg font-semibold"
            >
              Get Started
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition text-lg font-semibold"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Pain Points */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold mb-2">Struggling to understand your sales?</h3>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold mb-2">Don't know which products drive profit?</h3>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold mb-2">Hard to forecast inventory?</h3>
            </div>
          </div>
          <div className="text-center mt-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-xl font-semibold text-primary-600">
              We turn messy data into clear decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Analytics at Your Fingertips</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Sales Predictions</h3>
              <p className="text-gray-600">AI-driven forecasting for monthly demand and seasonal patterns</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📉</div>
              <h3 className="text-lg font-semibold mb-2">Discount–Profit Correlations</h3>
              <p className="text-gray-600">Understand the true impact of discounts on your bottom line</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">🧊</div>
              <h3 className="text-lg font-semibold mb-2">Cohort Analysis</h3>
              <p className="text-gray-600">Track customer retention and lifetime value across cohorts</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">📦</div>
              <h3 className="text-lg font-semibold mb-2">Inventory Insights</h3>
              <p className="text-gray-600">Smart alerts for over-stock, under-stock, and refill recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Selling Points */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose InsightFlow?</h2>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4 text-lg">
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">✓</span>
                <span>One-click data upload - Just upload your CSV or Excel file</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">✓</span>
                <span>Zero setup - No configuration, no coding required</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">✓</span>
                <span>Instant visuals - Get interactive dashboards in seconds</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">✓</span>
                <span>AI-driven predictions - Machine learning powered forecasting</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-3">✓</span>
                <span>Enterprise analytics for small businesses - Big data insights at startup prices</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">E-commerce Sellers</h3>
              <p className="text-gray-600">Optimize inventory and understand customer behavior</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">D2C Brands</h3>
              <p className="text-gray-600">Track cohort performance and product profitability</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Wholesalers</h3>
              <p className="text-gray-600">Forecast demand and manage stock levels</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Retail Stores</h3>
              <p className="text-gray-600">Identify best-sellers and dead stock</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Instagram Shop Owners</h3>
              <p className="text-gray-600">Understand product trends and customer segments</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">1️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Upload CSV or Excel</h3>
              <p className="text-gray-600">Simply drag and drop your sales data file</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">2️⃣</div>
              <h3 className="text-xl font-semibold mb-2">AI analyzes everything</h3>
              <p className="text-gray-600">Our algorithms process your data in seconds</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">3️⃣</div>
              <h3 className="text-xl font-semibold mb-2">Get predictions, insights & recommendations</h3>
              <p className="text-gray-600">Access comprehensive dashboards and actionable insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">"100% boost in clarity"</p>
              <p className="font-semibold">- E-commerce Business Owner</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">"20% increase in repeat customers"</p>
              <p className="font-semibold">- D2C Brand Founder</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 mb-4">"40% reduction in ad waste"</p>
              <p className="font-semibold">- Marketing Manager</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">InsightFlow</h3>
              <p className="text-gray-400">Turn your raw data into smart decisions.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
                <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InsightFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

