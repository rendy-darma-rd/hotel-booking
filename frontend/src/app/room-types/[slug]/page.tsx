import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import type { RoomType } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function RoomTypePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('room_types')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  const roomType = data as RoomType | null;

  if (!roomType) notFound();

  const [mainImage, ...otherImages] = roomType.images;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link href="/#rooms" className="text-sm font-medium text-stone-500 hover:text-stone-700">
        ← Back to all rooms
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-stone-100">
            {mainImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mainImage} alt={roomType.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-stone-300">
                <BedIcon />
              </div>
            )}
          </div>

          {otherImages.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {otherImages.slice(0, 4).map((img) => (
                <div key={img} className="aspect-square overflow-hidden rounded-xl bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <h1 className="mt-8 text-3xl font-bold tracking-tight text-stone-900">{roomType.name}</h1>
          <p className="mt-2 text-stone-500">
            Up to {roomType.max_occupancy} guests{roomType.size_sqm ? ` · ${roomType.size_sqm} m²` : ''}
          </p>
          {roomType.description && (
            <p className="mt-6 leading-relaxed text-stone-700">{roomType.description}</p>
          )}

          {roomType.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
                Amenities
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {roomType.amenities.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
                  >
                    <CheckIcon />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl border border-stone-200 p-6 shadow-sm">
            <p className="text-2xl font-bold text-stone-900">
              Rp {roomType.base_price.toLocaleString('id-ID')}
              <span className="text-base font-normal text-stone-500"> / night</span>
            </p>
            <p className="mt-1 text-sm text-stone-500">Up to {roomType.max_occupancy} guests</p>

            <Link
              href={`/room-types/${roomType.slug}/book`}
              className="mt-6 block w-full rounded-full bg-amber-500 px-6 py-3 text-center text-sm font-semibold text-white shadow-md shadow-amber-900/20 transition hover:bg-amber-400"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
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

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 text-amber-600"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
