import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import Product from '../../../../models/Product';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Get the order to revert stock
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Revert stock for items
    for (const item of order.itemsSummary) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: item.quantity }
      });
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();

    // Get the original order to revert stock
    const originalOrder = await Order.findById(params.id);

    if (!originalOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Revert stock for original items
    for (const item of originalOrder.itemsSummary) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: item.quantity }
      });
    }

    // Create new itemsSummary
    const itemsSummary = data.items.map(item => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
      category: item.category || 'Uncategorized'
    }));

    // Update order with new data
    const updatedOrder = await Order.findByIdAndUpdate(
      params.id,
      {
        status: data.status,
        notes: data.notes,
        total: data.total,
        itemsSummary: itemsSummary
      },
      { new: true }
    );

    // Update stock for new items
    for (const item of data.items) {
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stock: -item.quantity }
      });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}