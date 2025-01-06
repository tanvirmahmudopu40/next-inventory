'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Staff() {
  const { data: session } = useSession();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStaff, setFilteredStaff] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (staff.length > 0) {
      let filtered = [...staff];

      if (searchTerm) {
        filtered = filtered.filter(member =>
          (member.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (member.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (member.designation?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (member.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }

      setFilteredStaff(filtered);
    }
  }, [searchTerm, staff]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      const transformedData = data.map(staff => ({
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        department: staff.department,
        designation: staff.designation,
        phone: staff.phone || '',
        address: staff.address || '',
        userId: staff.userId?._id
      }));
      
      setStaff(transformedData);
    } catch (error) {
      setError('Failed to fetch staff');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${_id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete staff');
      }

      if (data.success) {
        const updatedStaff = staff.filter(member => member._id !== _id);
        setStaff(updatedStaff);
      } else {
        throw new Error('Failed to delete staff');
      }

    } catch (error) {
      setError(error.message || 'Failed to delete staff member');
      console.error('Error:', error);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#303c54]">Staff List</h2>
          
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center p-4">
          <Link
              href="/staff/add"
              className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#1b2e4b]"
            >
              Add Staff
            </Link>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
        </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#f8f9fa] border-b border-[#d8dbe0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dbe0]">
                {filteredStaff.map((member) => (
                  <tr key={member._id} className="hover:bg-[#f8f9fa]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {member.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {member.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {member.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {member.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192] space-x-2">
                      <Link
                        href={`/staff/${member._id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(member._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredStaff.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No staff members found matching your search' : 'No staff members available'}
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