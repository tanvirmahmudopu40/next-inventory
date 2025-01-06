import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Settings from '../../../models/Settings';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    await connectDB();
    const settings = await Settings.findOne().lean();
    
    if (!settings) {
      return NextResponse.json(
        { error: 'Settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());
    
    // Handle file uploads
    let logoPath = '';
    let faviconPath = '';
    
    if (formData.get('logo')) {
      const logo = formData.get('logo');
      const logoBuffer = await logo.arrayBuffer();
      const logoFilename = `logo-${Date.now()}${path.extname(logo.name)}`;
      await writeFile(
        `public/uploads/${logoFilename}`,
        Buffer.from(logoBuffer)
      );
      logoPath = `/uploads/${logoFilename}`;
    }

    if (formData.get('favicon')) {
      const favicon = formData.get('favicon');
      const faviconBuffer = await favicon.arrayBuffer();
      const faviconFilename = `favicon-${Date.now()}${path.extname(favicon.name)}`;
      await writeFile(
        `public/uploads/${faviconFilename}`,
        Buffer.from(faviconBuffer)
      );
      faviconPath = `/uploads/${faviconFilename}`;
    }

    // Required fields validation
    const requiredFields = ['title', 'phone', 'email', 'address', 'footerText'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Prepare settings data
    const settingsData = {
      title: data.title,
      phone: data.phone,
      email: data.email,
      address: data.address,
      city: data.city || '',
      state: data.state || '',
      country: data.country || '',
      zipCode: data.zipCode || '',
      footerText: data.footerText,
      currency: data.currency || 'USD',
      currencySymbol: data.currencySymbol || '$',
      timezone: data.timezone || 'UTC',
      dateFormat: data.dateFormat || 'MM/DD/YYYY',
      taxNumber: data.taxNumber || '',
      registrationNumber: data.registrationNumber || '',
      defaultLanguage: data.defaultLanguage || 'en',
      updatedAt: new Date()
    };

    // Add logo and favicon only if new files were uploaded
    if (logoPath) settingsData.logo = logoPath;
    if (faviconPath) settingsData.favicon = faviconPath;

    // Update or create settings
    const settings = await Settings.findOneAndUpdate(
      {}, // empty filter to match any document
      settingsData,
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).lean();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings: ' + error.message },
      { status: 500 }
    );
  }
} 