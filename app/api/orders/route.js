import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Create item summary for storing in Order table
    const itemsSummary = data.items.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      category: item.category || 'Uncategorized'
    }));

    // Create order without OrderItems
    const order = new Order({
      subtotal: data.subtotal,
      total: data.total,
      tax: data.tax,
      discount: data.discount,
      status: data.status,
      customerName: data.customerName,
      paymentMethod: data.paymentMethod,
      cashierName: data.cashierName,
      notes: data.notes,
      itemsSummary: itemsSummary // Store all items data in JSON field
    });

    await order.save();

    // Update product stock
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: -item.quantity }
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Order creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    );
  } 
}

// Add GET handler to fetch all orders
export async function GET() {
  try {
    await connectDB();
    const orders = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}