import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Warehouse from '../../../models/Warehouse';

export async function GET() {
  try {
    await connectDB();
    const warehouses = await Warehouse.find().sort({ name: 'asc' }).lean();
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const warehouse = await Warehouse.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      city: data.city || '',
      country: data.country || ''
    });
    return NextResponse.json(warehouse);
  } catch (error) {
    console.error('Failed to create warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to create warehouse' },
      { status: 500 }
    );
  }
} 