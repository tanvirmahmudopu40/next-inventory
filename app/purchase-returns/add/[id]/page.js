'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout';

export default function AddPurchaseReturn() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [purchasereturn, setPurchaseReturn] = useState({
    purchaseId: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    supplier: '',
    warehouse: '',
    items: [],
    note: '',
    totalAmount: 0
  });

  useEffect(() => {
    fetchPurchase();
  }, []);

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch purchase');
      const purchase = await response.json();
      
      setPurchaseReturn({
        purchaseId: purchase._id,
        date: new Date().toISOString().split('T')[0],
        invoiceNo: purchase.invoiceNo,
        supplier: purchase.supplier,
        warehouse: purchase.warehouse,
        items: purchase.items.map(item => ({
          ...item,
          returnQuantity: item.quantity,
          returnTotal: item.total
        })),
        totalAmount: purchase.totalAmount,
        note: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, updatedItem) => {
    setPurchaseReturn(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const returnQuantity = Math.min(
            updatedItem.returnQuantity || item.returnQuantity,
            item.quantity
          );
          const returnTotal = (returnQuantity * item.unitPrice) - (item.discount || 0);
          return {
            ...item,
            ...updatedItem,
            returnQuantity,
            returnTotal
          };
        }
        return item;
      }),
      totalAmount: prev.items.reduce((sum, item, i) => 
        sum + (i === index ? 
          ((updatedItem.returnQuantity || item.returnQuantity) * item.unitPrice) - (item.discount || 0) : 
          item.returnTotal
        ), 0
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (purchasereturn.items.length === 0) {
      setError('Please add at least one item to return');
      return;
    }

    setSaving(true);
    try {
      const returnResponse = await fetch('/api/purchase-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchasereturn),
      });

      if (!returnResponse.ok) throw new Error('Failed to create purchase return');

      const updateResponse = await fetch(`/api/purchases/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'RETURNED',
          date: purchasereturn.date,
          invoiceNo: purchasereturn.invoiceNo,
          supplier: purchasereturn.supplier,
          warehouse: purchasereturn.warehouse,
          items: purchasereturn.items,
          totalAmount: purchasereturn.totalAmount
        })
      });

      if (!updateResponse.ok) throw new Error('Failed to update purchase status');

      router.push('/purchase-returns');
    } catch (error) {
      setError(error.message);
      console.error('Error processing return:', error);
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
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#303c54]">Create Purchase Return</h1>
            <button
              type="button"
              onClick={() => router.push('/purchases')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={purchasereturn.date}
                      onChange={(e) => setPurchaseReturn({ ...purchasereturn, date: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice No
                    </label>
                    <input
                      type="text"
                      value={purchasereturn.invoiceNo}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={purchasereturn.supplier}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warehouse
                    </label>
                    <input
                      type="text"
                      value={purchasereturn.warehouse}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Purchased Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Return Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchasereturn.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.productName}</td>
                          <td className="px-4 py-2 text-right">{item.quantity}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              min="1"
                              max={item.quantity}
                              value={item.returnQuantity}
                              onChange={(e) => updateItem(index, { returnQuantity: parseInt(e.target.value) })}
                              className="w-20 p-1 text-right border rounded"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">${item.returnTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="px-4 py-2 text-right font-medium">Total Amount:</td>
                        <td className="px-4 py-2 text-right font-medium">${purchasereturn.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Right Column */}
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    value={purchasereturn.note}
                    onChange={(e) => setPurchaseReturn({ ...purchasereturn, note: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                    rows={4}
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-4 py-2 bg-[#321fdb] text-white rounded-lg hover:bg-[#2819b0] disabled:opacity-50"
                  >
                    {saving ? 'Processing...' : 'Submit Return'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}