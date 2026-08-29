'use client';

import type { BookingStatus } from '@/types/database';
import { updateBookingStatus } from './actions';

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  no_show: 'bg-gray-100 text-gray-600',
};

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

export function BookingStatusSelect({ id, status }: { id: string; status: BookingStatus }) {
  return (
    <form action={updateBookingStatus} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`rounded-full border-0 px-2 py-0.5 text-xs ${STATUS_STYLES[status]}`}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
