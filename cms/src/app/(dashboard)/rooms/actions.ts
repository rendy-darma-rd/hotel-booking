'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function roomFromForm(formData: FormData) {
  return {
    room_type_id: String(formData.get('room_type_id')),
    room_number: String(formData.get('room_number') ?? '').trim(),
    floor: String(formData.get('floor') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'active'),
    notes: String(formData.get('notes') ?? '').trim() || null,
  };
}

export async function createRoom(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').insert(roomFromForm(formData));

  if (error) return { error: error.message };

  revalidatePath('/rooms');
  redirect('/rooms');
}

export async function updateRoom(
  id: string,
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from('rooms').update(roomFromForm(formData)).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/rooms');
  redirect('/rooms');
}

export async function deleteRoom(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('rooms').delete().eq('id', id);
  revalidatePath('/rooms');
}
