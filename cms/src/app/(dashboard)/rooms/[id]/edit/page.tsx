import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RoomForm } from '../../room-form';
import { updateRoom } from '../../actions';
import type { Room, RoomType } from '@/types/database';

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: roomData }, { data: roomTypesData }] = await Promise.all([
    supabase.from('rooms').select('*').eq('id', id).single(),
    supabase.from('room_types').select('*').order('name'),
  ]);
  const room = roomData as Room | null;
  const roomTypes = roomTypesData as RoomType[] | null;

  if (!room) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Edit room {room.room_number}</h1>
      <RoomForm room={room} roomTypes={roomTypes ?? []} action={updateRoom.bind(null, id)} />
    </div>
  );
}
