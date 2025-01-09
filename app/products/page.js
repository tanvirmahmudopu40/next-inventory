'use client';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      if (selectedCategory) {
        filtered = filtered.filter(product => 
          product.category === selectedCategory
        );
      }

      if (searchTerm) {
        filtered = filtered.filter(product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name-asc':
            return a.title.localeCompare(b.title);
          case 'name-desc':
            return b.title.localeCompare(a.title);
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          default:
            return 0;
        }
      });

      setFilteredProducts(filtered);
    }
  }, [searchTerm, products, sortBy, selectedCategory]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }
      
      // Remove the deleted product from the state
      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (error) return <Layout><div>Error: {error}</div></Layout>;

  return (
    <Layout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#303c54]">Products</h2>
          <button
            onClick={() => router.push('/products/add')}
            className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0]"
          >
            Add Product
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb] placeholder-gray-400"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>

          <table className="min-w-full divide-y divide-[#d8dbe0]">
            <thead>
              <tr className="bg-[#f8f9fa]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#768192] uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8dbe0]">
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    {product.image ? (
                      <Image 
                        width={500}
                        height={300}
                        src={product.image} 
                        alt={product.title} 
                        className="h-12 w-12 object-cover rounded"
                        onError={(e) => e.target.src = '/placeholder-image.jpg'} 
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No image</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">{product.title}</td>
                  <td className="px-6 py-4">{product.category || '-'}</td>
                  <td className="px-6 py-4">{product.brand || '-'}</td>
                  <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => router.push(`/products/edit/${product._id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || selectedCategory ? 'No products found matching your criteria' : 'No products available'}
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