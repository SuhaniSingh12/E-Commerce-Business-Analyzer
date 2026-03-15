'use client';

import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKeys: { key: string; name: string; color: string }[];
  title?: string;
}

export default function BarChart({ data, xKey, yKeys, title }: BarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yKeys.map((y) => (
            <Bar key={y.key} dataKey={y.key} name={y.name} fill={y.color} />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

