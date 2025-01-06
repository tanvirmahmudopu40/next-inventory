import Link from 'next/link';
export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-foreground/10 hidden md:block">
      <nav className="p-4 space-y-2">
        <Link href="/" className="block px-4 py-2 rounded-lg hover:bg-foreground/5 transition">
          Dashboard
        </Link>
        <Link
         href="/products" className="block px-4 py-2 rounded-lg hover:bg-foreground/5 transition">
          Products
        </Link>
        <Link href="/orders" className="block px-4 py-2 rounded-lg hover:bg-foreground/5 transition">
          Orders List
        </Link>
        <Link href="#" className="block px-4 py-2 rounded-lg hover:bg-foreground/5 transition">
          Customers
        </Link>
        <Link href="#" className="block px-4 py-2 rounded-lg hover:bg-foreground/5 transition">
          Analytics
        </Link>
      </nav>
    </aside>
  );
} 