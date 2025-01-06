'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Users() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setUsers(data);
      } catch (error) {
        setError('Failed to fetch users');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (!session?.user?.role === 'ADMIN') {
    return (
      <Layout>
        <div className="p-4">
          <div className="bg-red-50 text-red-500 p-3 rounded-lg">
            Access denied. Admin privileges required.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#303c54]">Users</h2>
          <Link
            href="/auth/register"
            className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0]"
          >
            Add User
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d8dbe0]">
              <thead>
                <tr className="bg-[#f8f9fa]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dbe0]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f8f9fa]">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      {user.staff?.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#768192]">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
} 