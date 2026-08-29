import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import type { RoomType } from '@/types/database';
import { BookingForm } from './booking-form';

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

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
            {roomType.images[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={roomType.images[0]} alt={roomType.name} className="h-full w-full object-cover" />
            )}
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-gray-900">{roomType.name}</h1>
          <p className="mt-1 text-gray-500">
            Up to {roomType.max_occupancy} guests{roomType.size_sqm ? ` · ${roomType.size_sqm} m²` : ''}
          </p>
          {roomType.description && <p className="mt-4 text-gray-700">{roomType.description}</p>}

          {roomType.amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-900">Amenities</h2>
              <ul className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
                {roomType.amenities.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-lg font-semibold text-gray-900">
            Rp {roomType.base_price.toLocaleString('id-ID')}{' '}
            <span className="font-normal text-gray-500">/ night</span>
          </p>
        </div>

        <div>
          <BookingForm roomType={roomType} />
        </div>
      </div>
    </div>
  );
}
