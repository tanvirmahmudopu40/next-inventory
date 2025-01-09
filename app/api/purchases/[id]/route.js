import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Purchase from '../../../../models/Purchase';




export async function GET(request, { params }) {
  try {
    await connectDB();
    const purchase = await Purchase.findById(params.id).lean();

    if (!purchase) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Failed to fetch purchase:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Calculate total amount from items
    const totalAmount = data.items.reduce((sum, item) => 
      sum + ((item.quantity * item.unitPrice) - (item.discount || 0)), 0
    );

    // Calculate final amount with tax and shipping
    const taxAmount = (totalAmount * (data.tax || 0)) / 100;
    const finalAmount = totalAmount + taxAmount + (data.shipping || 0);
    const purchase = await Purchase.findByIdAndUpdate(
      params.id,
      {
        invoiceNo: data.invoiceNo,
        date: new Date(data.date),
        supplier: data.supplier,
        warehouse: data.warehouse,
        status: data.status,
        totalAmount: finalAmount,
        tax: data.tax || 0,
        shipping: data.shipping || 0,
        note: data.note || '',
        items: data.items // Store items directly as JSON
      },
      { new: true }
    );

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('Failed to update purchase:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase' },
      { status: 500 }
    );
  }
}



export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const purchase = await Purchase.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete purchase:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase' },
      { status: 500 }
    );
  } 
}