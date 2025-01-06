import Link from 'next/link';
export default function Header() {
  return (
    <header className="bg-foreground/5 border-b border-foreground/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">Inventory</h1>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/" className="hover:text-foreground/70 transition">Dashboard</Link>
          <Link href="/orders" className="hover:text-foreground/70 transition">Orders</Link>
          <Link href="/products" className="hover:text-foreground/70 transition">Products</Link>
          <Link href="#" className="hover:text-foreground/70 transition">Settings</Link>
        </nav>
      </div>
    </header>
  );
} 