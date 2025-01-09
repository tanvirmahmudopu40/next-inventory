'use client';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch products from the database
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Failed to fetch products:', error));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    const quantityNum = parseInt(quantity) || 1;
    if (quantityNum < 1 || quantityNum > product.stock) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityNum }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: quantityNum }];
    });

    // Reset form but keep quantity as 1
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) return;

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const completeSale = async () => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        total: cartTotal,
        subtotal: cartTotal,
        tax: 0,
        discount: 0,
        status: 'completed',
        customerName: 'Walk-in Customer',
        paymentMethod: 'Cash',
        cashierName: 'Admin',
        notes: '',
        items: cart.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          category: item.category || 'Uncategorized'
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create order');
      }

      const order = await response.json();
      
      // Clear cart
      setCart([]);
      
      // Refresh products to get updated stock
      const productsRes = await fetch('/api/products');
      const updatedProducts = await productsRes.json();
      setProducts(updatedProducts);

      // Redirect to invoice page
      window.location.href = `/orders/${order._id}`;
      
    } catch (error) {
      console.error('Failed to complete sale:', error);
      alert('Failed to complete sale. Please try again.');
    }
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    // Filter products by category
    if (categoryName) {
      const filteredProducts = products.filter(product => product.category === categoryName);
      setProducts(filteredProducts);
    } else {
      // If no category is selected (or "All" is clicked), fetch all products
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(error => console.error('Failed to fetch products:', error));
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (value) {
      const filtered = products.filter(product => 
        product.title.toLowerCase().includes(value.toLowerCase()) ||
        product.category.toLowerCase().includes(value.toLowerCase())
      );
      setProducts(filtered);
    } else {
      // If search is cleared, fetch all products or show products from selected category
      if (selectedCategory) {
        fetch('/api/products')
          .then(res => res.json())
          .then(data => {
            const filtered = data.filter(product => product.category === selectedCategory);
            setProducts(filtered);
          })
          .catch(error => console.error('Failed to fetch products:', error));
      } else {
        fetch('/api/products')
          .then(res => res.json())
          .then(data => setProducts(data))
          .catch(error => console.error('Failed to fetch products:', error));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
     
      <div className="flex-1 flex">
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
      <div className="flex h-1000px bg-gray-100">
        {/* Left Side - Categories & Products */}
        <div className="w-2/3 flex flex-col p-4">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Link href="/" className="px-6 py-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
                Dashboard
              </Link>
              
            </div>
            <div className="relative w-96">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-3 bg-white rounded-lg shadow-sm focus:shadow-md transition-all"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4" style={{marginBottom: '50px'}}>
            <div
              onClick={() => handleCategoryClick('')}
              className={`cursor-pointer rounded-lg p-4 flex flex-col items-center justify-center space-y-2 border transition-all ${
                selectedCategory === ''
                  ? 'border-[#321fdb] bg-[#321fdb]/10'
                  : 'border-gray-200 hover:border-[#321fdb]/50'
              }`}
            >
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-500 text-xs">All</span>
              </div>
              <span className="text-sm font-medium text-center">All Categories</span>
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className={`cursor-pointer rounded-lg p-4 flex flex-col items-center justify-center space-y-2 border transition-all ${
                  selectedCategory === category.name
                    ? 'border-[#321fdb] bg-[#321fdb]/10'
                    : 'border-gray-200 hover:border-[#321fdb]/50'
                }`}
              >
                {category.image ? (
                  <Image
                  width={300}
                  height={300}
                    src={category.image}
                    alt={category.name}
                    className="w-12 h-12 object-cover rounded"
                    onError={(e) => e.target.src = '/placeholder-image.jpg'}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No image</span>
                  </div>
                )}
                <span className="text-sm font-medium text-center">{category.name}</span>
              </div>
            ))}
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-4">
              {products.map((product) => (
                <button
                  key={product._id}
                  onClick={() => {
                    if (product.stock <= 0) return;
                    
                    setCart(prevCart => {
                      const existingItem = prevCart.find(item => item._id === product._id);
                      if (existingItem) {
                        return prevCart.map(item =>
                          item._id === product._id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                        );
                      }
                      return [...prevCart, { ...product, quantity: 1 }];
                    });
                  }}
                  disabled={product.stock <= 0}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left relative"
                >
                  {product.stock <= 5 && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-red-50 text-red-600 rounded-full text-xs">
                      Low Stock
                    </span>
                  )}
                  <div className="h-40 rounded-lg mb-3 overflow-hidden">
                    {product.image ? (
                      <Image
                      width={300}
                  height={300}
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = '/placeholder-image.jpg'}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="font-medium truncate">{product.title}</div>
                  <div className="text-sm text-gray-500 mb-2">Stock: {product.stock}</div>
                  <div className="text-lg font-semibold text-blue-600">
                    ${product.price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-1/3 bg-white p-4 shadow-lg flex flex-col" style={{height: 'calc(100vh - 120px)'}}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Current Order</h2>
            <button 
              onClick={() => setCart([])}
              className="text-red-500 hover:text-red-600"
            >
              Clear All
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {item.image ? (
                    <Image 
                    width={300}
                  height={300}
                      src={item.image} 
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => e.target.src = '/placeholder-image.jpg'}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.title}</div>
                    <div className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:shadow-md"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm hover:shadow-md"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tax (0%)</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={completeSale}
              disabled={cart.length === 0}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md transition-all"
            >
              Complete Sale ({cart.length} items)
            </button>
          </div>
        </div>
      </div>
      </div>
        </main>
      </div>
     
    </div>
  );
}
