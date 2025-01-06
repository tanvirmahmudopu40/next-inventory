'use client';
import ReportPage from '../../components/ReportPage';

const columns = [
  { key: 'createdAt', label: 'Date', type: 'date' },
  { key: 'invoiceNo', label: 'Invoice No' },
  { key: 'customerName', label: 'Customer' },
  { key: 'total', label: 'Total', type: 'currency' },
  { key: 'status', label: 'Status' },
];

export default function SalesReport() {
  return (
    <ReportPage
      title="Sales Report"
      type="sales"
      columns={columns}
    />
  );
} 