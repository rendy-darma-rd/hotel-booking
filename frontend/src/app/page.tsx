import Link from 'next/link';
import { createPublicClient } from '@/lib/supabase/public';
import type { HotelSettings, RoomType } from '@/types/database';

// Room availability and pricing change at runtime (CMS edits, bookings) —
// never serve a stale build-time snapshot of this page.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createPublicClient();

  const [{ data: settingsData }, { data: roomTypesData }] = await Promise.all([
    supabase.from('hotel_settings').select('*').single(),
    supabase.from('room_types').select('*').eq('is_active', true).order('base_price'),
  ]);

  const settings = settingsData as HotelSettings | null;
  const roomTypes = (roomTypesData as RoomType[] | null) ?? [];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <h1 className="text-xl font-semibold text-gray-900">{settings?.hotel_name ?? 'My Hotel'}</h1>
          {settings?.address && <p className="mt-1 text-sm text-gray-500">{settings.address}</p>}
        </div>
      </header>

      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <h2 className="text-2xl font-semibold text-gray-900">Welcome</h2>
          {settings?.description && <p className="mt-2 max-w-2xl text-gray-600">{settings.description}</p>}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-6 text-lg font-semibold text-gray-900">Rooms</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((rt) => (
            <Link
              key={rt.id}
              href={`/room-types/${rt.slug}`}
              className="block overflow-hidden rounded-lg border border-gray-200 hover:border-gray-300"
            >
              <div className="aspect-[4/3] bg-gray-100">
                {rt.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rt.images[0]} alt={rt.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900">{rt.name}</h3>
                <p className="mt-1 text-sm text-gray-500">Up to {rt.max_occupancy} guests</p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  Rp {rt.base_price.toLocaleString('id-ID')}{' '}
                  <span className="font-normal text-gray-500">/ night</span>
                </p>
              </div>
            </Link>
          ))}
          {!roomTypes.length && <p className="text-sm text-gray-500">No rooms available right now.</p>}
        </div>
      </main>
    </div>
  );
}
