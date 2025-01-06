'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/Layout';

export default function EditStaff({ params }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffData, setStaffData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    phone: '',
    address: '',
    password: '' // Optional for updates
  });

  useEffect(() => {
    // if (!session) {
    //   router.push('/login');
    //   return;
    // }
    fetchStaffData();
  }, [session]);

  const fetchStaffData = async () => {
    try {
      const response = await fetch(`/api/staff/${params.id}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setStaffData({
        name: data.name || '',
        email: data.email || '',
        department: data.department || '',
        designation: data.designation || '',
        phone: data.phone || '',
        address: data.address || '',
        password: '' // Empty for security
      });
    } catch (error) {
      setError('Failed to fetch staff data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/staff/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(staffData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      router.push('/staff');
    } catch (error) {
      setError(error.message || 'Failed to update staff');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-[#303c54] mb-4">Edit Staff</h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={staffData.name}
                  onChange={handleChange}
                  required
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={staffData.email}
                  onChange={handleChange}
                  required
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={staffData.department}
                  onChange={handleChange}
                  required
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={staffData.designation}
                  onChange={handleChange}
                  required
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={staffData.phone}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={staffData.address}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password (leave blank to keep unchanged)
                </label>
                <input
                  type="password"
                  name="password"
                  value={staffData.password}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/staff')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0] disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 