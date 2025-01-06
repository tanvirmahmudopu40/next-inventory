import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Supplier from '../../../models/Supplier';

export async function GET() {
  try {
    await connectDB();
    const suppliers = await Supplier.find().sort({ name: 'asc' }).lean();
    return NextResponse.json(suppliers);
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const supplier = await Supplier.create({
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      country: data.country || ''
    });
    return NextResponse.json(supplier);
  } catch (error) {
    console.error('Failed to create supplier:', error);
    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
} 