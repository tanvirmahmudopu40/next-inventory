import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
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
    const order = await prisma.order.create({
      data: {
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
      }
    });

    // Update product stock
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.quantity } }
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
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
} 