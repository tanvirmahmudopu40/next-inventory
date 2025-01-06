import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Staff from '../../../../models/Staff';
import User from '../../../../models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const staff = await Staff.findById(params.id)
      .populate('userId', 'name email role')
      .lean();

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(staff);
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();
    
    // Find staff and their associated user
    const staff = await Staff.findById(params.id);
    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    // Update user information
    const userUpdate = {
      name: data.name,
      email: data.email,
      updatedAt: Date.now()
    };

    if (data.password) {
      userUpdate.password = await bcrypt.hash(data.password, 10);
    }

    await User.findByIdAndUpdate(staff.userId, userUpdate);

    // Update staff information
    const updatedStaff = await Staff.findByIdAndUpdate(
      params.id,
      {
        name: data.name,
        email: data.email,
        department: data.department,
        designation: data.designation,
        phone: data.phone || '',
        address: data.address || '',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )
    .populate('userId', 'name email role')
    .lean();

    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error('Failed to update staff:', error);
    return NextResponse.json(
      { error: 'Failed to update staff' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const staff = await Staff.findById(params.id);

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    // Delete associated user
    await User.findByIdAndDelete(staff.userId);

    // Delete staff
    await Staff.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete staff:', error);
    return NextResponse.json(
      { error: 'Failed to delete staff' },
      { status: 500 }
    );
  }
}