import mongoose from 'mongoose';

const purchaseReturnSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  purchaseId: { type: String, required: true },
  invoiceNo: { type: String, required: true },
  supplier: { type: String, required: true },
  warehouse: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  note: { type: String },
  items: { type: mongoose.Schema.Types.Mixed, required: true }, // Store items as JSON
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Purchasereturn || mongoose.model('Purchasereturn', purchaseReturnSchema);