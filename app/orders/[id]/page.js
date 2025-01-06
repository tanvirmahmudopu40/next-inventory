'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useParams } from 'next/navigation';

export default function OrderDetails() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading order details...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!order) return <div className="p-4">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Invoice Header */}
        <div className="px-8 py-6 bg-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">INVOICE</h1>
              <p className="text-indigo-200">#{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Your Company Name</p>
              <p className="text-indigo-200">123 Business Street</p>
              <p className="text-indigo-200">City, Country 12345</p>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Bill To</h2>
              <p className="mt-2 text-lg font-medium text-gray-900">{order.customerName}</p>
            </div>
            <div className="text-right">
              <h2 className="text-sm font-medium text-gray-500">Invoice Details</h2>
              <p className="mt-2 text-gray-900">Date: {format(new Date(order.createdAt), 'MMMM d, yyyy')}</p>
              <p className="text-gray-900">Status: {order.status}</p>
              <p className="text-gray-900">Cashier: {order.cashierName}</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left text-sm font-semibold text-gray-600">Item</th>
                <th className="py-3 text-center text-sm font-semibold text-gray-600">Quantity</th>
                <th className="py-3 text-right text-sm font-semibold text-gray-600">Unit Price</th>
                <th className="py-3 text-right text-sm font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.itemsSummary.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-4">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </td>
                  <td className="py-4 text-center text-sm text-gray-900">{item.quantity}</td>
                  <td className="py-4 text-right text-sm text-gray-900">${item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-right text-sm text-gray-900">${item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary */}
          <div className="pt-4">
            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                
                <div className="flex justify-between text-lg font-semibold pt-3">
                  <p>Total</p>
                  <p>${order.total.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mt-8 border-t border-gray-200 pt-4">
              <h2 className="text-sm font-medium text-gray-500 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-150"
            >
              Print Invoice
            </button>
            <button
              onClick={() => window.location.href = '/orders'}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition duration-150"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 