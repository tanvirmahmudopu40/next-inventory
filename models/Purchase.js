import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  supplier: { type: String, required: true },
  warehouse: { type: String, required: true },
  status: { type: String, default: 'PENDING' }, // PENDING, RECEIVED, ORDERED
  totalAmount: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  note: { type: String },
  items: { type: mongoose.Schema.Types.Mixed, required: true }, // Store items as JSON
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);