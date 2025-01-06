'use client';
import ReportPage from '../../components/ReportPage';

const columns = [
  { key: 'createdAt', label: 'Date', type: 'date' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'customerName', label: 'Customer' },
  { key: 'totalAmount', label: 'Amount', type: 'currency' },
];

export default function SaleReturnsReport() {
  return (
    <ReportPage
      title="Sale Returns Report"
      type="sale-returns"
      columns={columns}
    />
  );
} 