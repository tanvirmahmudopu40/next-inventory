import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Staff from '../../../models/Staff';
import User from '../../../models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const staff = await Staff.find()
      .populate('userId', 'name email role')
      .sort({ name: 'asc' })
      .lean();
    return NextResponse.json(staff);
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    // Create user first
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'STAFF'
    });

    // Then create staff with reference to user
    const staff = await Staff.create({
      userId: user._id,
      name: data.name,
      email: data.email,
      department: data.department,
      designation: data.designation,
      phone: data.phone || '',
      address: data.address || ''
    });

    // Populate user data for response
    const populatedStaff = await Staff.findById(staff._id)
      .populate('userId', 'name email role')
      .lean();

    return NextResponse.json(populatedStaff);
  } catch (error) {
    console.error('Failed to create staff:', error);
    return NextResponse.json(
      { error: 'Failed to create staff' },
      { status: 500 }
    );
  }
} 