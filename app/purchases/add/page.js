'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../components/Layout';

export default function AddPurchase() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  const [purchase, setPurchase] = useState({
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    warehouse: '',
    status: 'PENDING',
    note: '',
    items: [],
    tax: 0,
    shipping: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
      setShowDropdown(true);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (supplierSearchTerm) {
      const filtered = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
      setShowSupplierDropdown(true);
    } else {
      setFilteredSuppliers([]);
      setShowSupplierDropdown(false);
    }
  }, [supplierSearchTerm, suppliers]);

  useEffect(() => {
    console.log("warehouseSearchTerm:", warehouseSearchTerm);
    console.log("warehouses:", warehouses);

    if (warehouseSearchTerm && Array.isArray(warehouses)) {
      const filtered = warehouses.filter(warehouse => {
        if (warehouse && warehouse.name) {
          const match = warehouse.name.toLowerCase().includes(warehouseSearchTerm.toLowerCase());
          console.log(`Checking warehouse: ${warehouse.name}, Match: ${match}`);
          return match;
        }
        return false;
      });
      console.log("filtered:", filtered);
      setFilteredWarehouses(filtered);
      setShowWarehouseDropdown(true);
    } else {
      setFilteredWarehouses([]);
      setShowWarehouseDropdown(false);
    }
  }, [warehouseSearchTerm, warehouses]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses');
      const data = await response.json();
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const handleProductSelect = (product) => {
    setPurchase(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id,
        productName: product.title,
        quantity: 1,
        unitPrice: '',
        discount: 0,
        total: 0
      }]
    }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSupplierSelect = (supplier) => {
    setPurchase(prev => ({ ...prev, supplier: supplier.name }));
    setSupplierSearchTerm('');
    setShowSupplierDropdown(false);
  };

  const handleWarehouseSelect = (warehouse) => {
    setPurchase(prev => ({ ...prev, warehouse: warehouse.name }));
    setWarehouseSearchTerm('');
    setShowWarehouseDropdown(false);
  };

  // Calculate totals
  const subtotal = purchase.items.reduce((sum, item) => 
    sum + ((item.quantity * item.unitPrice) - (item.discount || 0)), 0
  );
  const taxAmount = (subtotal * purchase.tax) / 100;
  const grandTotal = subtotal + taxAmount + (purchase.shipping || 0);

  const addItem = () => {
    setPurchase(prev => ({
      ...prev,
      items: [...prev.items, { 
        productName: '',
        batch: '',
        expiryDate: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0
      }]
    }));
  };

  const removeItem = (index) => {
    setPurchase(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, updatedItem) => {
    setPurchase(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const quantity = updatedItem.quantity || item.quantity;
          const unitPrice = updatedItem.unitPrice || item.unitPrice;
          const discount = updatedItem.discount || item.discount || 0;
          const total = (quantity * unitPrice) - discount;
          return {
            ...item,
            ...updatedItem,
            total
          };
        }
        return item;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purchase.supplier || !purchase.warehouse || purchase.items.length === 0) {
      setError('Please fill in all required fields and add at least one item');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...purchase,
          totalAmount: subtotal
        }),
      });

      if (!response.ok) throw new Error('Failed to create purchase');
      router.push('/purchases');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#303c54]">Add Purchase</h1>
            <button
              type="button"
              onClick={() => router.push('/purchases')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back to List
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Header Information */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Left Column */}
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={purchase.supplier || supplierSearchTerm}
                      onChange={(e) => {
                        setPurchase(prev => ({ ...prev, supplier: '' }));
                        setSupplierSearchTerm(e.target.value);
                      }}
                      placeholder="Search supplier..."
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                      required
                    />
                    {showSupplierDropdown && filteredSuppliers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredSuppliers.map((supplier) => (
                          <div
                            key={supplier.id}
                            onClick={() => handleSupplierSelect(supplier)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {supplier.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={purchase.warehouse || warehouseSearchTerm}
                      onChange={(e) => {
                        setPurchase(prev => ({ ...prev, warehouse: '' }));
                        setWarehouseSearchTerm(e.target.value);
                      }}
                      placeholder="Search warehouse..."
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                      required
                    />
                    {showWarehouseDropdown && filteredWarehouses.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredWarehouses.map((warehouse) => (
                          <div
                            key={warehouse.id}
                            onClick={() => handleWarehouseSelect(warehouse)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {warehouse.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Column */}
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    value={purchase.invoiceNo}
                    onChange={(e) => setPurchase({ ...purchase, invoiceNo: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    value={purchase.date}
                    onChange={(e) => setPurchase({ ...purchase, date: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={purchase.status}
                    onChange={(e) => setPurchase({ ...purchase, status: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ORDERED">Ordered</option>
                    <option value="RECEIVED">Received</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={purchase.note}
                    onChange={(e) => setPurchase({ ...purchase, note: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Product Search and Items Table */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="p-4 border-b">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                  />
                  {showDropdown && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredProducts.map(product => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleProductSelect(product)}
                        >
                          <div className="font-medium">{product.title}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-left">Quantity</th>
                      <th className="px-4 py-2 text-left">Unit Price</th>
                      <th className="px-4 py-2 text-left">Discount</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2">{item.productName}</td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, {
                              ...item,
                              quantity: parseInt(e.target.value) || 0
                            })}
                            className="w-20 p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, {
                              ...item,
                              unitPrice: parseFloat(e.target.value) || 0
                            })}
                            className="w-24 p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.discount || 0}
                            onChange={(e) => updateItem(index, {
                              ...item,
                              discount: parseFloat(e.target.value) || 0
                            })}
                            className="w-24 p-1 border rounded"
                          />
                        </td>
                        <td className="px-4 py-2">
                          ${item.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals and Action Buttons */}
            <div className="flex justify-between items-start">
              <div className="w-1/3">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tax (%):</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={purchase.tax}
                        onChange={(e) => setPurchase({ ...purchase, tax: parseFloat(e.target.value) || 0 })}
                        className="w-24 p-1 border rounded text-right"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shipping:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={purchase.shipping}
                        onChange={(e) => setPurchase({ ...purchase, shipping: parseFloat(e.target.value) || 0 })}
                        className="w-24 p-1 border rounded text-right"
                      />
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Grand Total:</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/purchases')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0] disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Purchase'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 