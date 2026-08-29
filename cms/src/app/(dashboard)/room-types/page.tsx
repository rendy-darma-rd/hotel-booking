import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deleteRoomType } from './actions';
import type { RoomType } from '@/types/database';

export default async function RoomTypesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('room_types').select('*').order('name');
  const roomTypes = data as RoomType[] | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Room Types</h1>
        <Link
          href="/room-types/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New room type
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Price / night</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Max occupancy</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roomTypes?.map((rt) => (
              <tr key={rt.id}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{rt.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">Rp {rt.base_price.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{rt.max_occupancy}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={
                      rt.is_active
                        ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800'
                        : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600'
                    }
                  >
                    {rt.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-sm">
                  <div className="flex justify-end gap-3">
                    <Link href={`/room-types/${rt.id}/edit`} className="text-gray-600 hover:text-gray-900">
                      Edit
                    </Link>
                    <form action={deleteRoomType}>
                      <input type="hidden" name="id" value={rt.id} />
                      <button type="submit" className="cursor-pointer text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {!roomTypes?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                  No room types yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
