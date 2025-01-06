'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';
import Image from 'next/image';

export default function AddCategory() {
  const router = useRouter();
  const [category, setCategory] = useState({
    name: '',
    image: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category),
      });

      if (!response.ok) throw new Error('Failed to create category');
      
      router.push('/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      setError('Failed to create category: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Create FormData and append file
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setCategory(prev => ({ ...prev, image: data.url }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image: ' + error.message);
      setImagePreview(null);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h2 className="text-2xl font-semibold text-[#303c54] mb-6">Add Category</h2>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name
              </label>
              <input
                type="text"
                value={category.name}
                onChange={(e) => setCategory({ ...category, name: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50"
                placeholder="Enter category name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Image
              </label>
              <div className="mt-1 flex items-center space-x-4">
                <div className="flex items-center justify-center w-32 h-32 border-2 border-gray-300 border-dashed rounded-lg overflow-hidden">
                  {imagePreview || category.image ? (
                    <Image
                      src={imagePreview || category.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-gray-500 text-sm">No image</div>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Choose Image
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/categories')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0] disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 