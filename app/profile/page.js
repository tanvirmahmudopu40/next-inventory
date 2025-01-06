'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';

// Input Field Component
const InputField = ({ label, type, value, onChange, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] disabled:bg-gray-200"
    />
  </div>
);

export default function Profile() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/profile');
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');

        setUserData((prev) => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
        }));
        setError('');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) fetchUserData();
    else setLoading(false);
  }, [session]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (userData.newPassword && !userData.currentPassword) {
      setError('Current password is required to change password');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setSuccess('Profile updated successfully');
      setUserData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      // Auto-dismiss success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#303c54] mb-6">Profile Settings</h2>

          {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4">{error}</div>}
          {success && <div className="bg-green-50 text-green-500 p-3 rounded-lg mb-4">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Name"
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              disabled={loading}
            />

            <InputField
              label="Email"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              disabled={loading}
            />

            <div className="border-t pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              <InputField
                label="Current Password"
                type="password"
                value={userData.currentPassword}
                onChange={(e) => setUserData({ ...userData, currentPassword: e.target.value })}
                disabled={loading}
              />
              <InputField
                label="New Password"
                type="password"
                value={userData.newPassword}
                onChange={(e) => setUserData({ ...userData, newPassword: e.target.value })}
                disabled={loading}
              />
              <InputField
                label="Confirm New Password"
                type="password"
                value={userData.confirmPassword}
                onChange={(e) => setUserData({ ...userData, confirmPassword: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end pt-4">
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
