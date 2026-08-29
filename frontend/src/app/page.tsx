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
  const heroImage = roomTypes.find((rt) => rt.images[0])?.images[0];

  return (
    <div>
      <section className="relative overflow-hidden bg-stone-900">
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/70 to-stone-900/50" />

        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center sm:py-36">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            {settings?.hotel_name ?? 'My Hotel'}
          </h1>
          {settings?.description && (
            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-200">{settings.description}</p>
          )}
          {settings?.address && <p className="mt-3 text-sm text-stone-400">{settings.address}</p>}

          <a
            href="#rooms"
            className="mt-10 inline-block rounded-full bg-amber-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 transition hover:bg-amber-400"
          >
            Explore Our Rooms
          </a>
        </div>
      </section>

      <section id="rooms" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-stone-900">Room Types</h2>
          <p className="mt-3 text-stone-500">
            Find the room that fits your stay — every room type shows real-time pricing and
            availability.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((rt) => (
            <Link
              key={rt.id}
              href={`/room-types/${rt.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                {rt.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={rt.images[0]}
                    alt={rt.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-stone-300">
                    <BedIcon />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-stone-900">{rt.name}</h3>
                {rt.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-stone-500">{rt.description}</p>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-stone-500">Up to {rt.max_occupancy} guests</span>
                  <span className="text-base font-semibold text-stone-900">
                    Rp {rt.base_price.toLocaleString('id-ID')}
                    <span className="font-normal text-stone-400">/night</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!roomTypes.length && (
          <p className="mt-12 text-center text-sm text-stone-500">No rooms available right now.</p>
        )}
      </section>
    </div>
  );
}

function BedIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      className="h-12 w-12"
    >
      <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 18v2M21 18v2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
