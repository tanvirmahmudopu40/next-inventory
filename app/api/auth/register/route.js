import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, password, role, staffData } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with or without staff data based on role
    if (role === 'STAFF' && staffData) {
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        staff: {
          department: staffData.department,
          designation: staffData.designation,
          phone: staffData.phone,
          address: staffData.address,
        }
      });

      return NextResponse.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          staff: user.staff
        }
      });
    } else {
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role
      });

      return NextResponse.json({
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}