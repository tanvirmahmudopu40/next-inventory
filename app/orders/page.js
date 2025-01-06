'use client';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [statuses] = useState(['pending', 'completed', 'RETURNED']);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      let filtered = [...orders];

      if (searchTerm) {
        filtered = filtered.filter(order =>
          (order.invoiceNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (order.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (order.status?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter) {
        filtered = filtered.filter(order => order.status === statusFilter);
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh orders list after deletion
        fetchOrders();
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order');
    }
  };

  const handleReturn = async (id) => {
    if (!confirm('Are you sure you want to return this order?')) return;

    try {
      // Navigate to the return form
      router.push(`/sale-returns/add/${id}`);
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
          <h2 className="text-2xl font-semibold text-[#303c54]">Orders</h2>
          <Link 
            href="/orders/add"
            className="px-4 py-2 bg-[#321fdb] text-white font-medium rounded-lg hover:bg-[#2819b0] transition-colors"
          >
            Create New Order
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d8dbe0]">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Invoice No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dbe0] bg-white">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#f8f9fa] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {order.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {format(new Date(order.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#321fdb]">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' 
                          ? 'bg-[#eaf7ec] text-[#2eb85c]' 
                          : 'bg-[#fff3cd] text-[#f9b115]'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-[#321fdb] hover:text-[#2819b0]"
                      >
                        View
                      </Link>
                      <Link
                        href={`/orders/edit/${order.id}`}
                        className="text-[#2eb85c] hover:text-[#24934a]"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="text-[#e55353] hover:text-[#d93737]"
                      >
                        Delete
                      </button>
                      {order.status === 'completed' && (
                        <button
                          onClick={() => handleReturn(order.id)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm || statusFilter ? 'No orders found matching your criteria' : 'No orders available'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
} 