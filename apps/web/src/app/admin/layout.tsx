'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UtensilsCrossed, Tag, ShoppingBag, LogOut } from 'lucide-react';
import './admin.css';

const NAV = [
  { label: 'Dashboard',  href: '/admin/dashboard',   icon: LayoutDashboard },
  { label: 'Menu Mgmt',  href: '/admin/menu',         icon: UtensilsCrossed },
  { label: 'Orders',     href: '/admin/orders',       icon: ShoppingBag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  // Don't render the shell on the login page
  if (pathname === '/admin/login') return <>{children}</>;

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="adminShell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebarLogo">
          <Image src="/logo.jpg" alt="DEK" width={44} height={44} style={{ borderRadius: '50%', objectFit: 'contain' }} />
          <div className="sidebarLogoText">
            <span className="sidebarBrand">Dawat E Khaas</span>
            <span className="sidebarSub">Admin Panel</span>
          </div>
        </div>

        <nav className="sidebarNav">
          {NAV.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`navItem ${pathname.startsWith(href) ? 'navItemActive' : ''}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="sidebarFooter">
          <button className="navItem" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <span className="topbarTitle">
            {NAV.find(n => pathname.startsWith(n.href))?.label ?? 'Admin'}
          </span>
          <div className="topbarRight">
            <span className="adminBadge">👤 admin</span>
          </div>
        </header>
        <div className="pageContent">{children}</div>
      </div>
    </div>
  );
}
