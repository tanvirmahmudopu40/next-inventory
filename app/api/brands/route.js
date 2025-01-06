import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Brand from '../../../models/Brand';

export async function GET() {
  try {
    await connectDB();
    const brands = await Brand.find().sort({ name: 'asc' }).lean();
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const brand = await Brand.create({
      name: data.name
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Failed to create brand:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
} 