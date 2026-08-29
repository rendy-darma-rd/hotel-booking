import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface MidtransNotification {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  transaction_id: string;
  fraud_status?: string;
}

function isValidSignature(body: MidtransNotification) {
  const expected = createHash('sha512')
    .update(body.order_id + body.status_code + body.gross_amount + process.env.MIDTRANS_SERVER_KEY)
    .digest('hex');
  return expected === body.signature_key;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as MidtransNotification;

  if (!isValidSignature(body)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: booking } = await admin
    .from('bookings')
    .select('id')
    .eq('booking_reference', body.order_id)
    .single();

  if (!booking) {
    return NextResponse.json({ received: true });
  }

  const { transaction_status: status, fraud_status: fraudStatus } = body;

  if (status === 'settlement' || (status === 'capture' && fraudStatus === 'accept')) {
    await admin.from('bookings').update({ status: 'confirmed' }).eq('id', booking.id);
    await admin
      .from('payments')
      .update({ status: 'succeeded', provider_payment_id: body.transaction_id })
      .eq('booking_id', booking.id);
  } else if (['deny', 'cancel', 'expire', 'failure'].includes(status)) {
    await admin.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
    await admin
      .from('payments')
      .update({ status: 'failed', provider_payment_id: body.transaction_id })
      .eq('booking_id', booking.id);
  } else if (['refund', 'partial_refund'].includes(status)) {
    await admin
      .from('payments')
      .update({ status: 'refunded', provider_payment_id: body.transaction_id })
      .eq('booking_id', booking.id);
  }
  // 'pending' (e.g. waiting for VA transfer / e-wallet confirmation) — no-op,
  // booking and payment stay 'pending' until a later notification arrives.

  return NextResponse.json({ received: true });
}
