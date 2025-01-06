import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  zipCode: { type: String },
  footerText: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  currencySymbol: { type: String, default: '$' },
  timezone: { type: String, default: 'UTC' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  logo: { type: String },
  favicon: { type: String },
  taxNumber: { type: String },
  registrationNumber: { type: String },
  defaultLanguage: { type: String, default: 'en' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Settings || mongoose.model('Settings', settingsSchema); 