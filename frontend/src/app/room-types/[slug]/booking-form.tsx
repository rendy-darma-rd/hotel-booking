'use client';

import { useActionState } from 'react';
import { createBooking, type BookingFormState } from './actions';
import type { RoomType } from '@/types/database';

const initialState: BookingFormState = { error: null };

export function BookingForm({ roomType }: { roomType: RoomType }) {
  const [state, formAction, pending] = useActionState(createBooking, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-gray-200 p-6">
      <input type="hidden" name="room_type_id" value={roomType.id} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="check_in" className="block text-sm font-medium text-gray-700">
            Check-in
          </label>
          <input
            id="check_in"
            name="check_in"
            type="date"
            required
            min={today}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="check_out" className="block text-sm font-medium text-gray-700">
            Check-out
          </label>
          <input
            id="check_out"
            name="check_out"
            type="date"
            required
            min={today}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="num_rooms" className="block text-sm font-medium text-gray-700">
            Rooms
          </label>
          <input
            id="num_rooms"
            name="num_rooms"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="num_adults" className="block text-sm font-medium text-gray-700">
            Adults
          </label>
          <input
            id="num_adults"
            name="num_adults"
            type="number"
            min={1}
            defaultValue={2}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="num_children" className="block text-sm font-medium text-gray-700">
            Children
          </label>
          <input
            id="num_children"
            name="num_children"
            type="number"
            min={0}
            defaultValue={0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700">
          Full name
        </label>
        <input
          id="guest_name"
          name="guest_name"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="guest_email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="guest_email"
            name="guest_email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="guest_phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            id="guest_phone"
            name="guest_phone"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="special_requests" className="block text-sm font-medium text-gray-700">
          Special requests
        </label>
        <textarea
          id="special_requests"
          name="special_requests"
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {pending ? 'Redirecting to payment…' : 'Book & pay'}
      </button>
    </form>
  );
}
