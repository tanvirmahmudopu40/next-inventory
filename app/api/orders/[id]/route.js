import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();



export async function GET(request, { params }) {
  try {
    const order = await prisma.order.findUnique({
      where: {
        id: params.id
      }
    });

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
    const { id } = params;

    // Get the order to revert stock
    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Revert stock for items
    for (const item of order.itemsSummary) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { increment: item.quantity } }
      });
    }

    // Delete the order
    await prisma.order.delete({
      where: { id }
    });

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
    const data = await request.json();

    // Get the original order to revert stock
    const originalOrder = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!originalOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Revert stock for original items
    for (const item of originalOrder.itemsSummary) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { increment: item.quantity } }
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
    const updatedOrder = await prisma.order.update({
      where: {
        id: params.id
      },
      data: {
        status: data.status,
        notes: data.notes,
        total: data.total,
        itemsSummary: itemsSummary
      }
    });

    // Update stock for new items
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
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