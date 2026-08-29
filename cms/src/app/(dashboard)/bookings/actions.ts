'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { BookingStatus } from '@/types/database';

export async function updateBookingStatus(formData: FormData) {
  const id = String(formData.get('id'));
  const status = String(formData.get('status')) as BookingStatus;

  const supabase = await createClient();
  await supabase.from('bookings').update({ status }).eq('id', id);

  revalidatePath('/bookings');
}
