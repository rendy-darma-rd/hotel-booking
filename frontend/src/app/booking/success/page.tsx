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
      <h1 className="text-2xl font-semibold text-gray-900">{heading}</h1>
      <p className="mt-2 text-gray-600">{message}</p>
    </div>
  );
}
