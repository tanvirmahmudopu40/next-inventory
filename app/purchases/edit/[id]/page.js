'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout';

export default function EditPurchase() {
  const router = useRouter();
  const params = useParams();
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [purchase, setPurchase] = useState({
    invoiceNo: '',
    date: '',
    supplier: '',
    warehouse: '',
    status: 'PENDING',
    note: '',
    items: [],
    tax: 0,
    shipping: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showWarehouseDropdown, setShowWarehouseDropdown] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchPurchase(),
      fetchSuppliers(),
      fetchWarehouses(),
      fetchProducts()
    ]);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = Array.isArray(products) ? products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      ) : [];
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
    if (warehouseSearchTerm) {
      const filtered = warehouses.filter(warehouse =>
        warehouse.name.toLowerCase().includes(warehouseSearchTerm.toLowerCase())
      );
      setFilteredWarehouses(filtered);
      setShowWarehouseDropdown(true);
    } else {
      setFilteredWarehouses([]);
      setShowWarehouseDropdown(false);
    }
  }, [warehouseSearchTerm, warehouses]);

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch purchase');
      const data = await response.json();
      setPurchase({
        ...data,
        date: new Date(data.date).toISOString().split('T')[0],
        items: data.items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          total: (item.quantity * item.unitPrice) - (item.discount || 0)
        }))
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    const response = await fetch('/api/suppliers');
    const data = await response.json();
    setSuppliers(data);
  };

  const fetchWarehouses = async () => {
    const response = await fetch('/api/warehouses');
    const data = await response.json();
    setWarehouses(data);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      // if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const addItem = () => {
    setPurchase(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
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

  const handleProductSelect = (product) => {
    setPurchase(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: product.id,
        productName: product.title,
        quantity: 1,
        unitPrice: product.price || 0,
        discount: 0,
        total: product.price || 0
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

  const subtotal = purchase.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxAmount = (subtotal * (purchase.tax || 0)) / 100;
  const grandTotal = subtotal + taxAmount + (purchase.shipping || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!purchase.supplier || !purchase.warehouse || purchase.items.length === 0) {
      setError('Please fill in all required fields and add at least one item');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`/api/purchases/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...purchase,
          totalAmount: grandTotal
        }),
      });

      if (!response.ok) throw new Error('Failed to update purchase');
      router.push('/purchases');
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
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-[#303c54] mb-6">Edit Purchase</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
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
                  Date
                </label>
                <input
                  type="date"
                  value={purchase.date}
                  onChange={(e) => setPurchase({ ...purchase, date: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
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
                  Warehouse
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={purchase.status}
                  onChange={(e) => setPurchase({ ...purchase, status: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                  required
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
                  rows="1"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items</h3>
                <div className="flex space-x-2 items-center">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                  />
                  <button
                    type="button"
                    onClick={addItem}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              {showDropdown && filteredProducts.length > 0 && (
                <div className="relative">
                  <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredProducts.map(product => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleProductSelect(product)}
                      >
                        {product.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm">
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
                          <td className="px-4 py-2">${item.total.toFixed(2)}</td>
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
            </div>

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
                        value={purchase.tax || 0}
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
                        value={purchase.shipping || 0}
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
                  disabled={saving}
                  className="px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0] disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}