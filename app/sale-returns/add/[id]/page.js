'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Layout from '../../../components/Layout';

export default function AddSaleReturn() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saleReturn, setSaleReturn] = useState({
    orderId: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    customerName: '',
    items: [],
    totalAmount: 0,
    note: ''
  });

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      
      const order = await response.json();
      
      // Transform order data for return
      setSaleReturn({
        orderId: order.id,
        date: new Date().toISOString().split('T')[0],
        invoiceNo: order.invoiceNo,
        customerName: order.customerName,
        items: order.itemsSummary.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.unitPrice,
          returnQuantity: 0,
          returnTotal: 0
        })),
        totalAmount: 0,
        note: ''
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index, updatedItem) => {
    setSaleReturn(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          const returnQuantity = Math.min(
            updatedItem.returnQuantity || item.returnQuantity,
            item.quantity
          );
          const returnTotal = (returnQuantity * item.price);
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
          ((updatedItem.returnQuantity || item.returnQuantity) * item.price) : 
          item.returnTotal
        ), 0
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saleReturn.items.length === 0) {
      setError('Please add at least one item to return');
      return;
    }

    setSaving(true);
    try {
      // Format items for submission
      const formattedItems = saleReturn.items.map(item => ({
        id: item.id,
        title: item.title,
        returnQuantity: item.returnQuantity,
        price: item.price,
        total: item.returnTotal
      }));

      // Prepare the sale return data for submission
      const saleReturnData = {
        ...saleReturn,
        items: formattedItems,
        totalAmount: saleReturn.totalAmount,
        note: saleReturn.note || ''
      };

      console.log('Submitting data:', saleReturnData);

      const returnResponse = await fetch('/api/sale-returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleReturnData),
      });

      if (!returnResponse.ok) {
        const errorData = await returnResponse.json();
        throw new Error(errorData.details || 'Failed to create sale return');
      }

      const updateResponse = await fetch(`/api/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'RETURNED',
          items: formattedItems
        })
      });

      // if (!updateResponse.ok) throw new Error('Failed to update order status');

      router.push('/sale-returns');
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

  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#303c54]">Create Sale Return</h2>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Return Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={saleReturn.date}
                      onChange={(e) => setSaleReturn({ ...saleReturn, date: e.target.value })}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#321fdb]/50 focus:border-[#321fdb]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice No
                    </label>
                    <input
                      type="text"
                      value={saleReturn.invoiceNo}
                      readOnly
                      className="w-full p-2 border rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={saleReturn.customerName}
                    readOnly
                    className="w-full p-2 border rounded-lg bg-gray-50"
                  />
                </div>

                <div className="mt-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Sold Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Return Qty</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {saleReturn.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.title}</td>
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
                          <td className="px-4 py-2 text-right">${item.price.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right">${item.returnTotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" className="px-4 py-2 text-right font-medium">Total Amount:</td>
                        <td className="px-4 py-2 text-right font-medium">${saleReturn.totalAmount.toFixed(2)}</td>
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
                    value={saleReturn.note}
                    onChange={(e) => setSaleReturn({ ...saleReturn, note: e.target.value })}
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