import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="bg-foreground/5 border-t border-foreground/10">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} Your Company Name. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 