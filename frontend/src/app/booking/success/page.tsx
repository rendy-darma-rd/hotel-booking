import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import type { BookingStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  let status: BookingStatus | null = null;
  if (ref) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('bookings')
      .select('status')
      .eq('booking_reference', ref)
      .single();
    status = (data?.status as BookingStatus | undefined) ?? null;
  }

  const confirmed = status === 'confirmed';
  const heading = confirmed ? 'Booking confirmed' : 'Payment received';
  const message = confirmed
    ? `Thank you! Your payment was successful${ref ? ` — reference ${ref}` : ''}. A confirmation has been sent to your email.`
    : `Thanks — we've received your payment details${ref ? ` for booking ${ref}` : ''}. For bank transfer or e-wallet payments this can take a few minutes to confirm; you'll receive an email once it's finalized.`;

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7">
          <path
            fillRule="evenodd"
            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">{heading}</h1>
      <p className="mt-2 text-stone-600">{message}</p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-900/20 transition hover:bg-amber-400"
      >
        Back to home
      </Link>
    </div>
  );
}
