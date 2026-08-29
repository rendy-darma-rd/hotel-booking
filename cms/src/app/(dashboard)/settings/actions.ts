'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function updateHotelSettings(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('hotel_settings')
    .update({
      hotel_name: String(formData.get('hotel_name') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim() || null,
      address: String(formData.get('address') ?? '').trim() || null,
      phone: String(formData.get('phone') ?? '').trim() || null,
      email: String(formData.get('email') ?? '').trim() || null,
      check_in_time: String(formData.get('check_in_time') ?? '14:00'),
      check_out_time: String(formData.get('check_out_time') ?? '12:00'),
    })
    .eq('id', true);

  if (error) return { error: error.message };

  revalidatePath('/settings');
  return { error: null };
}
