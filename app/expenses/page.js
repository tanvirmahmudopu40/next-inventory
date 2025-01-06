'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

import Link from 'next/link';
import Layout from '../components/Layout';
import { MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Expenses() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      let filtered = [...expenses];

      if (searchTerm) {
        filtered = filtered.filter(expense =>
          (expense.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (expense.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (expense.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (expense.amount?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
      }

      setFilteredExpenses(filtered);
    }
  }, [searchTerm, expenses]);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const response = await fetch('/api/expenses', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Failed to delete expense');
      
      // Refresh the list
      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
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
          <h2 className="text-2xl font-semibold text-[#303c54]">Expenses</h2>
          
        </div>

        <div className="bg-white rounded-lg shadow-sm">
        <div className="flex justify-between items-center p-4">
          <Link
              href="/expenses/add"
              className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0]"
            >
              Add Expense
            </Link>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search expenses..."
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
              <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
        </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#d8dbe0]">
              <thead className="bg-[#f8f9fa]">
                <tr>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8dbe0]">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    
                    <td className="px-6 py-4">{expense.category}</td>
                    <td className="px-6 py-4">${expense.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{format(new Date(expense.date), 'MMM d, yyyy')}</td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/expenses/edit/${expense._id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No expenses found matching your search' : 'No expenses available'}
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