'use client';
import ReportPage from '../../components/ReportPage';

const columns = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'amount', label: 'Amount', type: 'currency' },
];

export default function ExpensesReport() {
  return (
    <ReportPage
      title="Expenses Report"
      type="expenses"
      columns={columns}
    />
  );
} 