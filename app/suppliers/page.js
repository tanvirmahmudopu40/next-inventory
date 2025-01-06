'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Suppliers() {
  const { data: session } = useSession();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (suppliers.length > 0) {
      let filtered = [...suppliers];

      if (searchTerm) {
        filtered = filtered.filter(supplier =>
          (supplier.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (supplier.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (supplier.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (supplier.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }

      setFilteredSuppliers(filtered);
    }
  }, [searchTerm, suppliers]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;

    try {
      const response = await fetch(`/api/suppliers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete supplier');
      
      fetchSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Failed to delete supplier');
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
          <h2 className="text-2xl font-semibold text-[#303c54]">Suppliers</h2>
          
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <Link
              href="/suppliers/add"
              className="px-4 py-2 bg-[#321fdb] text-white font-medium rounded-lg hover:bg-[#2819b0] transition-colors"
            >
              Add Supplier
            </Link>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
        </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d8dbe0]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Phone
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
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td className="px-6 py-4">{supplier.name}</td>
                    <td className="px-6 py-4">{supplier.email}</td>
                    <td className="px-6 py-4">{supplier.phone}</td>
                    <td className="px-6 py-4">{supplier.city}</td>
                    <td className="px-6 py-4">{supplier.country}</td>
                    <td className="px-6 py-4 space-x-3">
                      <Link
                        href={`/suppliers/edit/${supplier._id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(supplier._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No suppliers found matching your search' : 'No suppliers available'}
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