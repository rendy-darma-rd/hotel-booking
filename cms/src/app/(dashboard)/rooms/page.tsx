import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deleteRoom } from './actions';

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-600',
};

export default async function RoomsPage() {
  const supabase = await createClient();
  const { data: rooms } = await supabase
    .from('rooms')
    .select('*, room_types(name)')
    .order('room_number');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Rooms</h1>
        <Link
          href="/rooms/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New room
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Room</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Floor</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {rooms?.map((room: any) => (
              <tr key={room.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{room.room_number}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{room.room_types?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{room.floor ?? '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[room.status]}`}>
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-3">
                    <Link href={`/rooms/${room.id}/edit`} className="text-gray-600 hover:text-gray-900">
                      Edit
                    </Link>
                    <form action={deleteRoom}>
                      <input type="hidden" name="id" value={room.id} />
                      <button type="submit" className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!rooms?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No rooms yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
