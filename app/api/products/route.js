import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Product from '../../../models/Product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ title: 'asc' }).lean();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const product = await Product.create({
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      brand: data.brand,
      category: data.category,
      image: data.image
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
} 