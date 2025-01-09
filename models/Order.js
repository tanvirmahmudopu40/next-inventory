import mongoose from 'mongoose';

const ItemSummarySchema = new mongoose.Schema({
  id: String,
  title: String,
  quantity: Number,
  unitPrice: Number,
  totalPrice: Number,
  category: String
});

const OrderSchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  invoiceNo: { type: String, unique: true, default: () => new mongoose.Types.ObjectId().toString() },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  itemsSummary: { type: [ItemSummarySchema], required: true }, // Will store complete items data
  customerName: { type: String, default: "Walk-in Customer" },
  paymentMethod: { type: String, default: "Cash" },
  status: { type: String, default: "Completed" },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  notes: { type: String, default: "" },
  cashierName: { type: String, default: "Admin" }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);