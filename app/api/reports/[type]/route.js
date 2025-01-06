import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const { fromDate, toDate } = await request.json();
    const type = params.type;

    let data;
    switch (type) {
      case 'sales':
        data = await prisma.order.findMany({
          where: {
            createdAt: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            }
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case 'purchases':
        data = await prisma.purchase.findMany({
          where: {
            date: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            }
          },
          orderBy: { date: 'desc' },
        });
        break;

      case 'sale-returns':
        data = await prisma.saleReturn.findMany({
          where: {
            createdAt: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            }
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case 'purchase-returns':
        data = await prisma.purchaseReturn.findMany({
          where: {
            date: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            }
          },
          orderBy: { date: 'desc' },
        });
        break;

      case 'expenses':
        data = await prisma.expense.findMany({
          where: {
            date: {
              gte: new Date(fromDate),
              lte: new Date(toDate),
            }
          },
          orderBy: { date: 'desc' },
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
} 