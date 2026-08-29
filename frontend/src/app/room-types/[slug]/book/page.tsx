import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import type { RoomType } from '@/types/database';
import { BookingForm } from './booking-form';

export const dynamic = 'force-dynamic';

export default async function BookRoomTypePage({ params }: { params: Promise<{ slug: string }> }) {
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
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/room-types/${roomType.slug}`}
        className="text-sm font-medium text-stone-500 hover:text-stone-700"
      >
        ← Back to {roomType.name}
      </Link>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-stone-200 p-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
          {roomType.images[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={roomType.images[0]} alt={roomType.name} className="h-full w-full object-cover" />
          )}
        </div>
        <div>
          <h1 className="font-semibold text-stone-900">{roomType.name}</h1>
          <p className="text-sm text-stone-500">
            Rp {roomType.base_price.toLocaleString('id-ID')} / night · Up to {roomType.max_occupancy}{' '}
            guests
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold tracking-tight text-stone-900">Complete your booking</h2>
      <p className="mt-1 text-sm text-stone-500">
        You&apos;ll be redirected to a secure payment page to finish paying with GoPay, OVO, DANA, QRIS,
        bank transfer, or card.
      </p>

      <div className="mt-6">
        <BookingForm roomType={roomType} />
      </div>
    </div>
  );
}
