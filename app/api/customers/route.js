import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Customer from '../../../models/Customer';

export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ name: 'asc' }).lean();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const customer = await Customer.create({
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || ''
    });
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 