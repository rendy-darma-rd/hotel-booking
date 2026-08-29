'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseListField(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function roomTypeFromForm(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim();
  return {
    name,
    slug: slugify(name),
    description: String(formData.get('description') ?? '').trim() || null,
    base_price: Number(formData.get('base_price')),
    max_occupancy: Number(formData.get('max_occupancy')),
    size_sqm: formData.get('size_sqm') ? Number(formData.get('size_sqm')) : null,
    amenities: parseListField(formData.get('amenities')),
    images: parseListField(formData.get('images')),
    is_active: formData.get('is_active') === 'on',
  };
}

export async function createRoomType(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from('room_types').insert(roomTypeFromForm(formData));

  if (error) return { error: error.message };

  revalidatePath('/room-types');
  redirect('/room-types');
}

export async function updateRoomType(
  id: string,
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from('room_types').update(roomTypeFromForm(formData)).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/room-types');
  redirect('/room-types');
}

export async function deleteRoomType(formData: FormData) {
  const id = String(formData.get('id'));
  const supabase = await createClient();
  await supabase.from('room_types').delete().eq('id', id);
  revalidatePath('/room-types');
}
