import { createClient } from '@/lib/supabase/server';
import { RoomForm } from '../room-form';
import { createRoom } from '../actions';
import type { RoomType } from '@/types/database';

export default async function NewRoomPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('room_types').select('*').order('name');
  const roomTypes = data as RoomType[] | null;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">New room</h1>
      <RoomForm roomTypes={roomTypes ?? []} action={createRoom} />
    </div>
  );
}
