import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Warehouse from '../../../../models/Warehouse';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const warehouse = await Warehouse.findById(params.id).lean();

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error('Failed to fetch warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouse' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    const warehouse = await Warehouse.findByIdAndUpdate(
      params.id,
      {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address || '',
        city: data.city || '',
        country: data.country || '',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error('Failed to update warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to update warehouse' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const warehouse = await Warehouse.findByIdAndDelete(params.id);

    if (!warehouse) {
      return NextResponse.json(
        { error: 'Warehouse not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete warehouse:', error);
    return NextResponse.json(
      { error: 'Failed to delete warehouse' },
      { status: 500 }
    );
  }
} 