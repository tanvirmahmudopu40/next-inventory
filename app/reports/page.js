'use client';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Reports() {
  const reports = [
    { title: 'Sales Report', href: '/reports/sales' },
    { title: 'Purchases Report', href: '/reports/purchases' },
    { title: 'Sale Returns Report', href: '/reports/sale-returns' },
    { title: 'Purchase Returns Report', href: '/reports/purchase-returns' },
    { title: 'Expenses Report', href: '/reports/expenses' },
  ];

  return (
    <Layout>
      <div className="p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#303c54]">Reports</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Link
              key={report.href}
              href={report.href}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium text-[#303c54]">{report.title}</h3>
              <p className="text-sm text-gray-500 mt-2">View detailed {report.title.toLowerCase()}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
} 