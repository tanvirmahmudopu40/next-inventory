'use client';
import ReportPage from '../../components/ReportPage';

const columns = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'totalAmount', label: 'Amount', type: 'currency' },
];

export default function PurchaseReturnsReport() {
  return (
    <ReportPage
      title="Purchase Returns Report"
      type="purchase-returns"
      columns={columns}
    />
  );
} 