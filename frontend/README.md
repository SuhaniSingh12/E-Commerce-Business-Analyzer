# InsightFlow Frontend

Modern Next.js web application for business analytics.

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Flask API backend running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Make sure the Flask API backend is running:
```bash
# From project root
python flask_api.py
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **Landing Page**: Marketing site with hero section, features, use cases, and testimonials
- **Dashboard**: Upload CSV/Excel files or use demo data
- **Cohort Analysis**: Customer retention, revenue cohorts, and geographic insights
- **Product Insights**: Hero/Zero products, seasonality, repeat purchase rates, inventory velocity
- **Customer Segmentation**: RFM analysis with Champions, Loyal, Big Spenders, At Risk segments
- **Demand Forecasting**: Monthly predictions with seasonal patterns
- **Anomaly Detection**: Return spikes, conversion drops, suspicious transactions
- **Inventory Management**: Stock alerts, refill recommendations
- **Store Heatmaps**: Visitor patterns and conversion funnels
- **Export Reports**: Download PDF and Excel reports

## Project Structure

```
frontend/
├── app/                  # Next.js app directory
│   ├── page.tsx         # Landing page
│   ├── dashboard/       # Dashboard pages
│   │   ├── page.tsx     # Main dashboard
│   │   ├── cohort/      # Cohort analysis
│   │   ├── product/     # Product insights
│   │   ├── rfm/         # Customer segmentation
│   │   ├── forecast/    # Demand forecasting
│   │   ├── anomaly/     # Anomaly detection
│   │   ├── inventory/   # Inventory management
│   │   ├── heatmaps/    # Store heatmaps
│   │   └── export/      # Export reports
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
│   ├── DataTable.tsx   # Data table component
│   ├── LineChart.tsx   # Line chart component
│   ├── BarChart.tsx    # Bar chart component
│   ├── Heatmap.tsx     # Heatmap component
│   └── FileUpload.tsx  # File upload component
└── context/            # React context (optional)
    └── InsightsContext.tsx
```

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Charting library
- **Axios**: HTTP client for API calls
- **React Dropzone**: File upload handling

## Building for Production

```bash
npm run build
npm start
```

## Configuration

API endpoint is configured in `next.config.js` to proxy requests to `http://localhost:5000/api`.

