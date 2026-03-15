'use client';

import React from 'react';

interface HeatmapProps {
  data: any;
  title?: string;
  rowLabel?: string;
  colLabel?: string;
}

export default function Heatmap({ data, title, rowLabel = 'Row', colLabel = 'Column' }: HeatmapProps) {
  if (!data || typeof data !== 'object') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Convert object/DataFrame-like structure to array
  let rows: string[] = [];
  let cols: string[] = [];
  let values: number[][] = [];

  if (data.index && data.columns && data.values) {
    // DataFrame-like structure
    rows = data.index || [];
    cols = data.columns || [];
    values = data.values || [];
  } else {
    // Object with row names as keys
    rows = Object.keys(data);
    if (rows.length > 0 && typeof data[rows[0]] === 'object') {
      cols = Object.keys(data[rows[0]]);
      values = rows.map(row => cols.map(col => data[row][col] || 0));
    }
  }

  if (rows.length === 0 || cols.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxVal = Math.max(...values.flat().filter(v => !isNaN(v)));
  const minVal = Math.min(...values.flat().filter(v => !isNaN(v)));

  const getColor = (val: number) => {
    if (isNaN(val) || maxVal === minVal) return 'bg-gray-100';
    const ratio = (val - minVal) / (maxVal - minVal);
    const intensity = Math.floor(ratio * 255);
    return `bg-blue-${Math.max(100, Math.min(900, Math.floor(100 + intensity / 32) * 100))}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 border">{rowLabel}</th>
              {cols.map((col, idx) => (
                <th key={idx} className="px-4 py-2 border text-sm font-medium">
                  {String(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="px-4 py-2 border font-medium">{String(row)}</td>
                {cols.map((col, colIdx) => {
                  const val = values[rowIdx]?.[colIdx] || 0;
                  return (
                    <td
                      key={colIdx}
                      className={`px-4 py-2 border text-center ${getColor(val)}`}
                      title={`${row} / ${col}: ${val.toLocaleString()}`}
                    >
                      {typeof val === 'number' ? val.toLocaleString() : String(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

