import { createClient } from '@/lib/supabase/server';
import { BookingStatusSelect } from './booking-status-select';
import type { BookingStatus } from '@/types/database';

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, room_types(name)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Bookings</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reference</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Guest</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Room type</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Dates</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Rooms</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {bookings?.map((booking: any) => (
              <tr key={booking.id}>
                <td className="px-4 py-3 text-sm font-mono text-gray-900">{booking.booking_reference}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div>{booking.guest_name}</div>
                  <div className="text-xs text-gray-400">{booking.guest_email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{booking.room_types?.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {booking.check_in} → {booking.check_out}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{booking.num_rooms}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {booking.currency} {booking.total_price}
                </td>
                <td className="px-4 py-3 text-sm">
                  <BookingStatusSelect id={booking.id} status={booking.status as BookingStatus} />
                </td>
              </tr>
            ))}
            {!bookings?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
