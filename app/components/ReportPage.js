'use client';
import { useState } from 'react';
import Layout from './Layout';
import { format } from 'date-fns';

export default function ReportPage({ title, type, columns }) {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);

  const fetchReport = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both from and to dates');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/reports/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromDate,
          toDate,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      alert('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals for currency/price columns
  const totals = {};
  if (reportData.length > 0) {
    columns.forEach(column => {
      if (column.type === 'currency' || column.type === 'price') {
        totals[column.key] = reportData.reduce((sum, row) => {
          return sum + (Number(row[column.key]) || 0);
        }, 0);
      }
    });
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#303c54]">{title}</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            {/* Date Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full md:w-48 p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full md:w-48 p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <button
                onClick={fetchReport}
                disabled={loading}
                className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0] disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>

            {/* Report Display */}
            {reportData.length > 0 && (
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#d8dbe0]">
                    <thead>
                      <tr className="bg-[#f8f9fa]">
                        {columns.map((column) => (
                          <th
                            key={column.key}
                            className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase"
                          >
                            {column.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#d8dbe0]">
                      {reportData.map((row, index) => (
                        <tr key={index}>
                          {columns.map((column) => (
                            <td key={column.key} className="px-6 py-4">
                              {formatCellValue(row[column.key], column.type)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                    {/* Totals Row */}
                    {Object.keys(totals).length > 0 && (
                      <tfoot>
                        <tr className="bg-gray-50 font-medium">
                          {columns.map((column) => (
                            <td key={column.key} className="px-6 py-4">
                              {totals[column.key] 
                                ? formatCellValue(totals[column.key], column.type)
                                : column.key === columns[0].key 
                                  ? 'Total'
                                  : ''}
                            </td>
                          ))}
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function formatCellValue(value, type) {
  if (!value) return '';
  
  switch (type) {
    case 'date':
      return format(new Date(value), 'MMM d, yyyy');
    case 'price':
    case 'currency':
      return `$${Number(value).toFixed(2)}`;
    default:
      return value;
  }
} 