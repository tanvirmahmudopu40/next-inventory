import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Purchasereturn from '../../../models/Purchasereturn';

const dbUri = process.env.MONGODB_URI;

export async function GET() {
  try {
    await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
    const returns = await Purchasereturn.find().sort({ date: -1 });
    return NextResponse.json(returns);
  } catch (error) {
    console.error('Failed to fetch purchase returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase returns' },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const purchasereturn = new Purchasereturn({
      date: new Date(data.date),
      purchaseId: data.purchaseId,
      invoiceNo: data.invoiceNo,
      supplier: data.supplier,
      warehouse: data.warehouse,
      totalAmount: data.totalAmount,
      note: data.note,
      items: data.items
    });

    await purchasereturn.save();
    return NextResponse.json(purchasereturn);
  } catch (error) {
    console.error('Failed to create purchase return:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase return' },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect();
  }
}