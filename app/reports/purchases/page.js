'use client';
import ReportPage from '../../components/ReportPage';

const columns = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'totalAmount', label: 'Amount', type: 'currency' },
  { key: 'status', label: 'Status' },
];

export default function PurchasesReport() {
  return (
    <ReportPage
      title="Purchases Report"
      type="purchases"
      columns={columns}
    />
  );
} 