import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Best practice for Next.js API routes - singleton pattern
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

const prisma = globalForPrisma.prisma;

export async function GET() {
  try {
    console.log('Attempting to connect to database...'); // Debug log
    const returns = await prisma.saleReturn.findMany({
      orderBy: {
        date: 'desc'
      }
    });
    console.log('Successfully fetched returns:', returns); // Debug log
    return NextResponse.json(returns);
  } catch (error) {
    console.error('Database connection error:', error); // Detailed error log
    return NextResponse.json(
      { error: 'Failed to fetch sale returns', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received data:', data);

    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    // Format items for storage
    const formattedItems = data.items
      .filter(item => item.returnQuantity > 0)
      .map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.returnQuantity,
        price: item.price,
        total: item.returnTotal
      }));

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale return
      const saleReturn = await tx.saleReturn.create({
        data: {
          date: new Date(data.date),
          orderId: String(data.orderId),
          invoiceNo: String(data.invoiceNo),
          customerName: String(data.customerName),
          totalAmount: Number(data.totalAmount),
          note: data.note || '',
          items: formattedItems
        }
      });

      // Update the order status to 'returned'
      await tx.order.update({
        where: { id: data.orderId },
        data: { status: 'returned' }
      });

      // Update product stock for returned items
      for (const item of formattedItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });
      }

      return saleReturn;
    });

    console.log('Created sale return:', result);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Detailed database error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create sale return', 
        details: error.message,
        name: error.name,
        code: error.code 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 