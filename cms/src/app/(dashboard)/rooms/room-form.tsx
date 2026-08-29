'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { Room, RoomType } from '@/types/database';

type FormAction = (prevState: { error: string | null }, formData: FormData) => Promise<{ error: string | null }>;

export function RoomForm({
  room,
  roomTypes,
  action,
}: {
  room?: Room;
  roomTypes: RoomType[];
  action: FormAction;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div>
        <label htmlFor="room_type_id" className="block text-sm font-medium text-gray-700">
          Room type
        </label>
        <select
          id="room_type_id"
          name="room_type_id"
          required
          defaultValue={room?.room_type_id}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select a room type
          </option>
          {roomTypes.map((rt) => (
            <option key={rt.id} value={rt.id}>
              {rt.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="room_number" className="block text-sm font-medium text-gray-700">
            Room number
          </label>
          <input
            id="room_number"
            name="room_number"
            required
            defaultValue={room?.room_number}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
            Floor
          </label>
          <input
            id="floor"
            name="floor"
            defaultValue={room?.floor ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={room?.status ?? 'active'}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={room?.notes ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save room'}
        </button>
        <Link
          href="/rooms"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
