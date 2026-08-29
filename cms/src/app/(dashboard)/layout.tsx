import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { signOut } from './actions';

const NAV_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/room-types', label: 'Room Types' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/settings', label: 'Settings' },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <nav className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-900">Hotel CMS</span>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-gray-900">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
