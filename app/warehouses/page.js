'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Warehouses() {
  const { data: session } = useSession();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (warehouses.length > 0) {
      let filtered = [...warehouses];

      if (searchTerm) {
        filtered = filtered.filter(warehouse =>
          (warehouse.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (warehouse.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (warehouse.address?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (warehouse.city?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (warehouse.country?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }

      setFilteredWarehouses(filtered);
    }
  }, [searchTerm, warehouses]);

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      const data = await response.json();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return;

    try {
      const response = await fetch(`/api/warehouses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete warehouse');
      
      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Failed to delete warehouse');
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
          <h2 className="text-2xl font-semibold text-[#303c54]">Warehouses</h2>
          
        </div>

        <div className="bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center p-4">
          <Link
              href="/warehouses/add"
              className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0]"
            >
              Add Warehouse
            </Link>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search warehouses..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
        </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d8dbe0]">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Name
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Country
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dbe0]">
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse._id}>
                    <td className="px-6 py-4">{warehouse.name}</td>
                    
                    <td className="px-6 py-4">{warehouse.phone}</td>
                    <td className="px-6 py-4">{warehouse.address}</td>
                    <td className="px-6 py-4">{warehouse.city}</td>
                    <td className="px-6 py-4">{warehouse.country}</td>
                    
                    <td className="px-6 py-4 space-x-3">
                      <Link
                        href={`/warehouses/edit/${warehouse._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(warehouse._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredWarehouses.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No warehouses found matching your search' : 'No warehouses available'}
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