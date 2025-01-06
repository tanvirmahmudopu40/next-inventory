'use client';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { format } from 'date-fns';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    if (brands.length > 0) {
      const filtered = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBrands(filtered);
    }
  }, [searchTerm, brands]);

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands');
      const data = await response.json();
      setBrands(data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete brand');
      
      fetchBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand');
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
          <h2 className="text-2xl font-semibold text-[#303c54]">Brands</h2>
          
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex justify-between mb-6">
          <Link
              href="/brands/add"
              className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0]"
            >
              Add Brand
          </Link>
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brands..."
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400 transition-colors duration-200"
            />
          </div>
        </div>

          <table className="min-w-full divide-y divide-[#d8dbe0]">
            <thead>
              <tr className="bg-[#f8f9fa]">
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dbe0]">
              {filteredBrands.map((brand) => (
                <tr key={brand._id}>
                  <td className="px-6 py-4">{brand.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(brand.createdAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <Link
                      href={`/brands/edit/${brand._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(brand._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBrands.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? 'No brands found matching your search' : 'No brands available'}
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