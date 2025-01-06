'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout';

export default function EditWarehouse() {
  const router = useRouter();
  const params = useParams();
  const [warehouse, setWarehouse] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWarehouse();
  }, []);

  const fetchWarehouse = async () => {
    try {
      const response = await fetch(`/api/warehouses/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch warehouse');
      const data = await response.json();
      setWarehouse(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!warehouse.name.trim()) {
      setError('Warehouse name is required');
      return;
    }
    if (!warehouse.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!warehouse.phone.trim()) {
      setError('Phone is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/warehouses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(warehouse),
      });

      if (!response.ok) throw new Error('Failed to update warehouse');
      
      router.push('/warehouses');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
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
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-semibold text-[#303c54] mb-6">Edit Warehouse</h1>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warehouse Name
              </label>
              <input
                type="text"
                value={warehouse.name}
                onChange={(e) => setWarehouse({ ...warehouse, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                placeholder="Enter warehouse name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={warehouse.email}
                onChange={(e) => setWarehouse({ ...warehouse, email: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                value={warehouse.phone}
                onChange={(e) => setWarehouse({ ...warehouse, phone: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                value={warehouse.address}
                onChange={(e) => setWarehouse({ ...warehouse, address: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={warehouse.city}
                onChange={(e) => setWarehouse({ ...warehouse, city: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                value={warehouse.country}
                onChange={(e) => setWarehouse({ ...warehouse, country: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                placeholder="Enter country"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.push('/warehouses')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0] disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 