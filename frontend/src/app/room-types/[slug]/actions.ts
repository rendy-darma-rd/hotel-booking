'use server';

import { redirect } from 'next/navigation';
import { createPublicClient } from '@/lib/supabase/public';
import { createAdminClient } from '@/lib/supabase/admin';
import { snap } from '@/lib/midtrans';
import type { RoomType } from '@/types/database';

export type BookingFormState = { error: string | null };

function nightsBetween(checkIn: string, checkOut: string) {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export async function createBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const roomTypeId = String(formData.get('room_type_id'));
  const checkIn = String(formData.get('check_in'));
  const checkOut = String(formData.get('check_out'));
  const numRooms = Math.max(1, Number(formData.get('num_rooms')) || 1);
  const numAdults = Math.max(1, Number(formData.get('num_adults')) || 1);
  const numChildren = Math.max(0, Number(formData.get('num_children')) || 0);
  const guestName = String(formData.get('guest_name') ?? '').trim();
  const guestEmail = String(formData.get('guest_email') ?? '').trim();
  const guestPhone = String(formData.get('guest_phone') ?? '').trim() || null;
  const specialRequests = String(formData.get('special_requests') ?? '').trim() || null;

  if (!checkIn || !checkOut || checkOut <= checkIn) {
    return { error: 'Please choose a valid check-in and check-out date.' };
  }
  if (!guestName || !guestEmail) {
    return { error: 'Please provide your name and email.' };
  }

  const publicClient = createPublicClient();

  const { data: roomTypeData } = await publicClient
    .from('room_types')
    .select('*')
    .eq('id', roomTypeId)
    .eq('is_active', true)
    .single();
  const roomType = roomTypeData as RoomType | null;

  if (!roomType) {
    return { error: 'This room type is no longer available.' };
  }
  if (numAdults + numChildren > roomType.max_occupancy * numRooms) {
    return { error: `This room type allows up to ${roomType.max_occupancy} guests per room.` };
  }

  const { data: availableRooms, error: availabilityError } = await publicClient.rpc(
    'get_available_rooms',
    { p_room_type_id: roomTypeId, p_check_in: checkIn, p_check_out: checkOut }
  );

  if (availabilityError || typeof availableRooms !== 'number' || availableRooms < numRooms) {
    return { error: 'Not enough rooms available for the selected dates.' };
  }

  const nights = nightsBetween(checkIn, checkOut);
  // Midtrans settles in IDR only, and gross_amount must be a whole number
  // (Rupiah has no subunit in practice).
  const totalPrice = Math.round(roomType.base_price * numRooms * nights);
  const currency = 'IDR';

  const admin = createAdminClient();

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .insert({
      room_type_id: roomTypeId,
      num_rooms: numRooms,
      check_in: checkIn,
      check_out: checkOut,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      num_adults: numAdults,
      num_children: numChildren,
      total_price: totalPrice,
      currency,
      special_requests: specialRequests,
    })
    .select('*')
    .single();

  if (bookingError || !booking) {
    return { error: 'Could not create the booking. Please try again.' };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const itemName = `${roomType.name} - ${nights} night(s) x ${numRooms} room(s)`.slice(0, 50);

  let redirectUrl: string;
  let snapToken: string;
  try {
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: booking.booking_reference,
        gross_amount: totalPrice,
      },
      customer_details: {
        first_name: guestName,
        email: guestEmail,
        phone: guestPhone ?? undefined,
      },
      item_details: [
        {
          id: roomType.id,
          price: totalPrice,
          quantity: 1,
          name: itemName,
        },
      ],
      callbacks: {
        finish: `${siteUrl}/booking/success?ref=${booking.booking_reference}`,
      },
    });
    redirectUrl = transaction.redirect_url;
    snapToken = transaction.token;
  } catch (err) {
    // Midtrans failed — don't leave a pending booking permanently holding
    // inventory (get_available_rooms counts pending bookings as occupied).
    await admin.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
    console.error('Midtrans Snap transaction creation failed:', err);
    return { error: 'Payment could not be started. Please try again in a moment.' };
  }

  await admin.from('payments').insert({
    booking_id: booking.id,
    provider: 'midtrans',
    provider_session_id: snapToken,
    amount: totalPrice,
    currency,
    status: 'pending',
  });

  redirect(redirectUrl);
}
