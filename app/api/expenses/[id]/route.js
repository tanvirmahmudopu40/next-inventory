import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Expense from '../../../../models/Expense';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const expense = await Expense.findById(params.id).lean();

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to fetch expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const data = await request.json();
    const expense = await Expense.findByIdAndUpdate(
      params.id,
      {
        title: data.title,
        date: new Date(data.date),
        category: data.category,
        amount: parseFloat(data.amount),
        reference: data.reference || '',
        note: data.note || '',
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to update expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const expense = await Expense.findByIdAndDelete(params.id);

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
} 