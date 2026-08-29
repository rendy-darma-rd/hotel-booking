'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { RoomType } from '@/types/database';

type FormAction = (prevState: { error: string | null }, formData: FormData) => Promise<{ error: string | null }>;

export function RoomTypeForm({ roomType, action }: { roomType?: RoomType; action: FormAction }) {
  const [state, formAction, pending] = useActionState(action, { error: null });

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={roomType?.name}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={roomType?.description ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="base_price" className="block text-sm font-medium text-gray-700">
            Base price / night (IDR)
          </label>
          <input
            id="base_price"
            name="base_price"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={roomType?.base_price}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="max_occupancy" className="block text-sm font-medium text-gray-700">
            Max occupancy
          </label>
          <input
            id="max_occupancy"
            name="max_occupancy"
            type="number"
            min="1"
            required
            defaultValue={roomType?.max_occupancy ?? 2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="size_sqm" className="block text-sm font-medium text-gray-700">
            Size (sqm)
          </label>
          <input
            id="size_sqm"
            name="size_sqm"
            type="number"
            step="0.01"
            min="0"
            defaultValue={roomType?.size_sqm ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">
          Amenities (one per line)
        </label>
        <textarea
          id="amenities"
          name="amenities"
          rows={4}
          defaultValue={roomType?.amenities?.join('\n') ?? ''}
          placeholder={'Free WiFi\nAir conditioning\nMini bar'}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="images" className="block text-sm font-medium text-gray-700">
          Image URLs (one per line)
        </label>
        <textarea
          id="images"
          name="images"
          rows={3}
          defaultValue={roomType?.images?.join('\n') ?? ''}
          placeholder="https://…"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={roomType?.is_active ?? true}
          className="h-4 w-4 rounded border-gray-300"
        />
        <label htmlFor="is_active" className="text-sm text-gray-700">
          Visible on website
        </label>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save room type'}
        </button>
        <Link
          href="/room-types"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
