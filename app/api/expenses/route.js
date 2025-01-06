import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Expense from '../../../models/Expense';

export async function GET() {
  try {
    await connectDB();
    const expenses = await Expense.find()
      .sort({ date: 'desc' })
      .lean();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const expense = await Expense.create({
      title: data.title,
      date: new Date(data.date),
      category: data.category,
      amount: parseFloat(data.amount),
      reference: data.reference || '',
      note: data.note || ''
    });
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to create expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    const expense = await Expense.findByIdAndDelete(id).lean();
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to delete expense:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const data = await request.json();
    const expense = await Expense.findByIdAndUpdate(
      data.id,
      {
        title: data.title,
        date: new Date(data.date),
        category: data.category,
        amount: parseFloat(data.amount),
        reference: data.reference || '',
        note: data.note || ''
      },
      { new: true }
    ).lean();
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Failed to update expense:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
      { status: 500 }
    );
  }
} 