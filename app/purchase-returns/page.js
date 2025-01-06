'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function PurchaseReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    if (returns.length > 0) {
      const uniqueWarehouses = [...new Set(returns.map(r => r.warehouse))];
      setWarehouses(uniqueWarehouses);
    }
  }, [returns]);

  useEffect(() => {
    if (returns.length > 0) {
      let filtered = [...returns];

      if (searchTerm) {
        filtered = filtered.filter(purchaseReturn =>
          (purchaseReturn.invoiceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (purchaseReturn.supplier?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (purchaseReturn.warehouse?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }

      if (warehouseFilter) {
        filtered = filtered.filter(purchaseReturn => purchaseReturn.warehouse === warehouseFilter);
      }

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setFilteredReturns(filtered);
    }
  }, [searchTerm, returns, warehouseFilter]);

  const fetchReturns = async () => {
    try {
      const response = await fetch('/api/purchase-returns');
      const data = await response.json();
      setReturns(data);
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
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
          <h2 className="text-2xl font-semibold text-[#303c54]">Purchase Returns</h2>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="mb-6 flex gap-4">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search purchase returns..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
            </div>

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
                  Total Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dbe0]">
              {filteredReturns.map((purchaseReturn) => (
                <tr key={purchaseReturn._id}>
                  <td className="px-6 py-4">
                    {format(new Date(purchaseReturn.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">{purchaseReturn.invoiceNo}</td>
                  <td className="px-6 py-4">{purchaseReturn.supplier}</td>
                  <td className="px-6 py-4">{purchaseReturn.warehouse}</td>
                  <td className="px-6 py-4">${purchaseReturn.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
              {filteredReturns.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || warehouseFilter ? 'No purchase returns found matching your search' : 'No purchase returns available'}
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