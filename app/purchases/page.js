'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [warehouses, setWarehouses] = useState([]);
  const [statuses] = useState(['PENDING', 'COMPLETED', 'RETURNED', 'CANCELLED']);

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    if (purchases.length > 0) {
      const uniqueWarehouses = [...new Set(purchases.map(p => p.warehouse))];
      setWarehouses(uniqueWarehouses);
    }
  }, [purchases]);

  useEffect(() => {
    if (purchases.length > 0) {
      let filtered = [...purchases];

      if (searchTerm) {
        filtered = filtered.filter(purchase =>
          purchase.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.warehouse.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter) {
        filtered = filtered.filter(purchase => purchase.status === statusFilter);
      }

      if (warehouseFilter) {
        filtered = filtered.filter(purchase => purchase.warehouse === warehouseFilter);
      }

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

      setFilteredPurchases(filtered);
    }
  }, [searchTerm, purchases, statusFilter, warehouseFilter]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases');
      const data = await response.json();
      setPurchases(data);
    } catch (error) {
      console.error('Failed to fetch purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this purchase?')) return;

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete purchase');
      
      fetchPurchases();
    } catch (error) {
      console.error('Error deleting purchase:', error);
      alert('Failed to delete purchase');
    }
  };

  const handleReturn = async (id) => {
    if (!confirm('Are you sure you want to return this purchase?')) return;

    try {
      // First, get the purchase details
      const purchaseResponse = await fetch(`/api/purchases/${id}`);
      if (!purchaseResponse.ok) throw new Error('Failed to fetch purchase');
      const purchase = await purchaseResponse.json();

      // Create the purchase return
      const returnResponse = await fetch('/api/purchase-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchaseId: purchase.id,
          date: new Date(),
          invoiceNo: purchase.invoiceNo,
          supplier: purchase.supplier,
          warehouse: purchase.warehouse,
          totalAmount: purchase.totalAmount,
          items: purchase.items,
          note: `Return for purchase ${purchase.invoiceNo}`
        }),
      });

      if (!returnResponse.ok) throw new Error('Failed to create return');

      // Update the purchase status
      const updateResponse = await fetch(`/api/purchases/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RETURNED' })
      });

      if (!updateResponse.ok) throw new Error('Failed to update purchase');
      
      fetchPurchases();
    } catch (error) {
      console.error('Error processing return:', error);
      alert('Failed to process return');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#321fdb]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#303c54]">Purchases</h2>
          <Link
            href="/purchases/add"
            className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0]"
          >
            Add Purchase
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search purchases..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
            >
              <option value="">All Warehouses</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>
          </div>

          <table className="min-w-full divide-y divide-[#d8dbe0]">
            <thead>
              <tr className="bg-[#f8f9fa]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Invoice No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Warehouse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dbe0]">
              {filteredPurchases.map((purchase) => (
                <tr key={purchase._id}>
                  <td className="px-6 py-4">
                    {format(new Date(purchase.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">{purchase.invoiceNo}</td>
                  <td className="px-6 py-4">{purchase.supplier}</td>
                  <td className="px-6 py-4">{purchase.warehouse}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      purchase.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      purchase.status === 'RECEIVED' ? 'bg-green-100 text-green-800' :
                      purchase.status === 'RETURNED' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <Link
                      href={`/purchases/edit/${purchase._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    {purchase.status !== 'RETURNED' && (
                      <Link
                        href={`/purchase-returns/add/${purchase._id}`}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        Return
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(purchase._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No purchases found matching your search' : 'No purchases available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
} 