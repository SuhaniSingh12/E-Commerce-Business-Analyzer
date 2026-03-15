'use client';

import React from 'react';

interface DataTableProps {
  data: any[];
  columns: string[];
  title?: string;
}

export default function DataTable({ data, columns, title }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 100).map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {typeof row[colIdx] === 'number' 
                      ? row[colIdx].toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : String(row[colIdx] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > 100 && (
        <p className="mt-4 text-sm text-gray-500">Showing first 100 of {data.length} rows</p>
      )}
    </div>
  );
}

