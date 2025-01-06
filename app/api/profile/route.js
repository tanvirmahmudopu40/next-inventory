import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';

export async function PUT(request) {
  let client;
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, email, currentPassword, newPassword } = data;

    // Connect to the database
    const { db, client: mongoClient } = await connectDB();
    client = mongoClient;

    const usersCollection = db.collection('users');
    const staffCollection = db.collection('staff'); // For staff role updates

    // Find the current user
    const user = await usersCollection.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password if changing the password
    if (newPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }
    }

    // Check if email is being changed and is already in use
    if (email !== user.email) {
      const existingUser = await usersCollection.findOne({ email });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Prepare the update data
    const updateData = {
      name,
      email,
    };

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user profile
    await usersCollection.updateOne(
      { email: session.user.email },
      { $set: updateData }
    );

    // If the user is a staff member, update the staff collection
    if (user.role === 'STAFF') {
      await staffCollection.updateOne(
        { userId: user.id },
        { $set: { name, email } }
      );
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  } finally {
    // Ensure MongoDB client is properly closed
    client?.close();
  }
}

export async function GET() {
  let client;
  try {
    console.log('Fetching session...');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session) {
      console.log('Unauthorized - No session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Connecting to MongoDB...');
    const { db, client: mongoClient } = await connectDB();
    client = mongoClient;

    console.log('Fetching user from database...');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne(
      { email: session.user.email },
      { projection: { _id: 0, name: 1, email: 1 } }
    );

    console.log('Fetched user:', user);

    if (!user) {
      console.log('User not found in database.');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User fetched successfully');
    return NextResponse.json(user);

  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  } finally {
    console.log('Closing MongoDB connection...');
    client?.close();
  }
}
