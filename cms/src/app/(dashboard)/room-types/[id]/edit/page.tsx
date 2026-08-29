import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RoomTypeForm } from '../../room-type-form';
import { updateRoomType } from '../../actions';
import type { RoomType } from '@/types/database';

export default async function EditRoomTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from('room_types').select('*').eq('id', id).single();
  const roomType = data as RoomType | null;

  if (!roomType) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Edit {roomType.name}</h1>
      <RoomTypeForm roomType={roomType} action={updateRoomType.bind(null, id)} />
    </div>
  );
}
