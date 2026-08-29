import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ count: roomTypeCount }, { count: roomCount }, { count: pendingCount }] = await Promise.all([
    supabase.from('room_types').select('*', { count: 'exact', head: true }),
    supabase.from('rooms').select('*', { count: 'exact', head: true }),
    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  const cards = [
    { label: 'Room types', value: roomTypeCount ?? 0, href: '/room-types' },
    { label: 'Rooms', value: roomCount ?? 0, href: '/rooms' },
    { label: 'Pending bookings', value: pendingCount ?? 0, href: '/bookings' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-gray-200 bg-white p-6 hover:border-gray-300"
          >
            <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
            <div className="mt-1 text-sm text-gray-500">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
