'use client';

import { useActionState } from 'react';
import { createBooking, type BookingFormState } from './actions';
import type { RoomType } from '@/types/database';

const initialState: BookingFormState = { error: null };
const inputClass =
  'mt-1 block w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500';
const labelClass = 'block text-sm font-medium text-stone-700';

export function BookingForm({ roomType }: { roomType: RoomType }) {
  const [state, formAction, pending] = useActionState(createBooking, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="room_type_id" value={roomType.id} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="check_in" className={labelClass}>
            Check-in
          </label>
          <input id="check_in" name="check_in" type="date" required min={today} className={inputClass} />
        </div>
        <div>
          <label htmlFor="check_out" className={labelClass}>
            Check-out
          </label>
          <input id="check_out" name="check_out" type="date" required min={today} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="num_rooms" className={labelClass}>
            Rooms
          </label>
          <input
            id="num_rooms"
            name="num_rooms"
            type="number"
            min={1}
            defaultValue={1}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="num_adults" className={labelClass}>
            Adults
          </label>
          <input
            id="num_adults"
            name="num_adults"
            type="number"
            min={1}
            defaultValue={2}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="num_children" className={labelClass}>
            Children
          </label>
          <input id="num_children" name="num_children" type="number" min={0} defaultValue={0} className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="guest_name" className={labelClass}>
          Full name
        </label>
        <input id="guest_name" name="guest_name" required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="guest_email" className={labelClass}>
            Email
          </label>
          <input id="guest_email" name="guest_email" type="email" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="guest_phone" className={labelClass}>
            Phone
          </label>
          <input id="guest_phone" name="guest_phone" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="special_requests" className={labelClass}>
          Special requests
        </label>
        <textarea id="special_requests" name="special_requests" rows={2} className={inputClass} />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full cursor-pointer rounded-full bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-amber-900/20 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Redirecting to payment…' : 'Book & pay'}
      </button>
    </form>
  );
}
