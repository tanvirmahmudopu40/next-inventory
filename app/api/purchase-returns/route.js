import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Purchasereturn from '../../../models/Purchasereturn';



export async function GET() {
  try {
    await connectDB();
    const returns = await Purchasereturn.find().sort({ date: -1 });
    // const returns = await Purchasereturn.findById(params.id).lean();
    return NextResponse.json(returns);
  } catch (error) {
    console.error('Failed to fetch purchase returns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase returns' },
      { status: 500 }
    );
  } 
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    

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
  } 
}