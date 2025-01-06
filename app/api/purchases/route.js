import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '../../../lib/mongodb';
import Purchase from '../../../models/Purchase';

connectDB();

export async function GET() {
  try {
    const purchases = await Purchase.find().sort({ date: -1 });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Failed to fetch purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received data:', data); // Debug log
    
    // Calculate total amount from items including discount
    const totalAmount = data.items.reduce((sum, item) => 
      sum + ((item.quantity * item.unitPrice) - (item.discount || 0)), 0
    );

    // Calculate final amount with tax and shipping
    const taxAmount = (totalAmount * (data.tax || 0)) / 100;
    const finalAmount = totalAmount + taxAmount + (data.shipping || 0);

    // Create purchase with all data directly in the purchase collection
    const purchase = new Purchase({
      invoiceNo: data.invoiceNo,
      date: new Date(data.date),
      supplier: data.supplier,
      warehouse: data.warehouse,
      status: data.status,
      totalAmount: finalAmount,
      tax: data.tax || 0,
      shipping: data.shipping || 0,
      note: data.note || '',
      items: data.items // This will be stored as an array of objects
    });

    await purchase.save();

    console.log('Created purchase:', purchase); // Debug log
    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Failed to create purchase:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase: ' + error.message },
      { status: 500 }
    );
  }
}