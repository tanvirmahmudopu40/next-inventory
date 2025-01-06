'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from './SettingsProvider';
import Footer from './Footer';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UsersIcon,
  CogIcon,
  ChartBarIcon,
  BellIcon,
  MagnifyingGlassIcon,
  TagIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ArrowUturnLeftIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  PlusCircleIcon,
  ListBulletIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  UserPlusIcon,
  
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }) {
  const { settings } = useSettings();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated' && mounted) {
      router.push('/auth/login');
    }
  }, [status, router, mounted]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ebedef]">
        <div className="text-[#321fdb]">Loading...</div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#ebedef]">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-full mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center ml-4">
                {settings?.logo && (
                  <div className="relative h-8 w-8 mr-2">
                    <Image
                      src={settings.logo}
                      alt="Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <span className="text-lg font-semibold text-gray-800">
                  {settings?.title || 'Dashboard'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-[#3c4b64] transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo - Fixed at top */}
        <div className="h-16 flex items-center px-4 bg-[#303c54] border-b border-[#1b1b1b]/10 sticky top-0 z-10">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-white p-1 rounded">
              <svg className="w-8 h-8" viewBox="0 0 512 512" fill="#3c4b64">
                <path d="M256.1 96c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160-71.6-160-160-160zm0 288c-70.7 0-128-57.3-128-128s57.3-128 128-128 128 57.3 128 128-57.3 128-128 128z"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-lg">CoreUI Free</span>
          </Link>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="p-2 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar">
          <ul className="space-y-1">
            <NavItem 
              href="/" 
              icon={<HomeIcon className="h-5 w-5" />} 
              text="Dashboard" 
            />
            <NavItem 
              href="/orders/add" 
              icon={<PlusCircleIcon className="h-5 w-5" />} 
              text="POS"
            />
            <NavItem 
              href="/sales" 
              icon={<ShoppingCartIcon className="h-5 w-5" />} 
              text="Sales"
            >
              <NavItem href="/orders" icon={<ListBulletIcon className="h-4 w-4" />} text="Sales List" />
              <NavItem href="/orders/add" icon={<PlusCircleIcon className="h-4 w-4" />} text="POS" />
              </NavItem>

            <NavItem 
              href="/purchases" 
              icon={<ClipboardDocumentListIcon className="h-5 w-5" />} 
              text="Purchases"
            >
              <NavItem href="/purchases" icon={<ListBulletIcon className="h-4 w-4" />} text="Purchases List" />
              <NavItem href="/purchases/add" icon={<PlusCircleIcon className="h-4 w-4" />} text="Add Purchase" />
              </NavItem>

            <NavItem 
              href="/products" 
              icon={<ShoppingBagIcon className="h-5 w-5" />} 
              text="Products"
            >
              <NavItem href="/products" icon={<ListBulletIcon className="h-4 w-4" />} text="Products List" />
              <NavItem href="/products/add" icon={<PlusCircleIcon className="h-4 w-4" />} text="Add Product" />
              <NavItem href="/categories" icon={<TagIcon className="h-4 w-4" />} text="Categories" />
              <NavItem href="/brands" icon={<BuildingStorefrontIcon className="h-4 w-4" />} text="Brands" />
             
            </NavItem>

            <NavItem 
              href="/returns" 
              icon={<ShoppingCartIcon className="h-5 w-5" />} 
              text="Returns"
            >
              <NavItem href="/sale-returns" icon={<ReceiptRefundIcon className="h-4 w-4" />} text="Sale Returns" />
              <NavItem href="/purchase-returns" icon={<ListBulletIcon className="h-4 w-4" />} text="Purchase Returns" />
              
            </NavItem>

            <NavItem 
              href="/reports" 
              icon={<ChartBarIcon className="h-5 w-5" />} 
              text="Reports"
            >
              <NavItem href="/reports/sales" icon={<ArrowTrendingUpIcon className="h-4 w-4" />} text="Sales Report" />
              <NavItem href="/reports/purchases" icon={<DocumentTextIcon className="h-4 w-4" />} text="Purchases Report" />
              <NavItem href="/reports/sale-returns" icon={<ArrowTrendingDownIcon className="h-4 w-4" />} text="Sale Returns Report" />
              <NavItem href="/reports/purchase-returns" icon={<ArrowTrendingDownIcon className="h-4 w-4" />} text="Purchase Returns Report" />
              <NavItem href="/reports/expenses" icon={<BanknotesIcon className="h-4 w-4" />} text="Expenses Report" />
            </NavItem>
            <NavItem 
                href="/customers" 
                icon={<UserGroupIcon className="h-5 w-5" />} 
                text="Peoples"    
              >
                <NavItem href="/customers" icon={<ListBulletIcon className="h-4 w-4" />} text="Customers List" />
                <NavItem href="/staff" icon={<PlusCircleIcon className="h-4 w-4" />} text="Staff List" />
              </NavItem>
            <NavItem 
              href="/suppliers" 
              icon={<UserGroupIcon className="h-5 w-5" />} 
              text="Suppliers" 
            />
            <NavItem 
              href="/warehouses" 
              icon={<BuildingOfficeIcon className="h-5 w-5" />} 
              text="Warehouse" 
            />

            <NavItem 
              href="/expenses" 
              icon={<CurrencyDollarIcon className="h-5 w-5" />} 
              text="Expenses" 
            />

            <NavItem 
              href="/settings" 
              icon={<CogIcon className="h-5 w-5" />} 
              text="Settings" 
            />
             <NavItem 
              href="/profile" 
              icon={<UserIcon className="h-5 w-5" />} 
              text="Profile" 
            />

            
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} transition-margin duration-200 ease-in-out min-h-screen`}>
        {/* Header */}
        <header className="bg-white border-b border-[#d8dbe0] sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-[#768192] hover:text-[#321fdb]"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#768192]" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-[#d8dbe0] focus:outline-none focus:border-[#321fdb] text-sm w-64"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-3">
              <Link
                href="/orders/add"
                className="px-4 py-2 h-9 rounded-lg bg-[#321fdb] text-white hover:bg-[#321fdb]/80 transition-colors duration-200 ease-in-out"
              >
                POS
              </Link>
                <div className="h-9 w-9 rounded-lg bg-[#321fdb] text-white flex items-center justify-center font-medium">
                  {session?.user?.name?.charAt(0)}
                </div>
                <div className="text-sm">
                  <div className="font-medium text-[#768192]">{session?.user?.name}</div>
                  <div className="text-[#768192]/60 text-xs">{session?.user?.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[#768192] hover:text-[#321fdb]"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Breadcrumb */}
          
        </header>

        {/* Page Content */}
        <main className="p-4">
          {children}
        </main>
        
      </div>
    </div>
  );
}

function NavItem({ href, icon, text, children, active }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = Boolean(children);
  const pathname = usePathname();
  
  // Check if current path or any child path is active
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <li>
      {hasChildren ? (
        <div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-[#321fdb] text-white'
                : 'text-[#ffffff]/80 hover:bg-[#321fdb]/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <span className="text-sm font-medium">{text}</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && (
            <ul className="mt-1 ml-4 space-y-1">
              {children}
            </ul>
          )}
        </div>
      ) : (
        <Link
          href={href}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            isActive
              ? 'bg-[#321fdb] text-white'
              : 'text-[#ffffff]/80 hover:bg-[#321fdb]/80 hover:text-white'
          }`}
        >
          {icon}
          <span className="text-sm font-medium">{text}</span>
        </Link>
      )}
    </li>
  );
} 