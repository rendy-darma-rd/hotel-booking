import type { HotelSettings } from '@/types/database';

function formatTime(time: string) {
  return time.slice(0, 5);
}

export function SiteFooter({ settings }: { settings: HotelSettings | null }) {
  const hotelName = settings?.hotel_name ?? 'My Hotel';

  return (
    <footer className="border-t border-stone-800 bg-stone-900 text-stone-300">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-base font-semibold text-white">{hotelName}</h3>
          {settings?.description && (
            <p className="mt-2 max-w-xs text-sm text-stone-400">{settings.description}</p>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Contact</h4>
          <ul className="mt-3 space-y-1.5 text-sm">
            {settings?.address && <li>{settings.address}</li>}
            {settings?.phone && <li>{settings.phone}</li>}
            {settings?.email && <li>{settings.email}</li>}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Hours</h4>
          <ul className="mt-3 space-y-1.5 text-sm">
            {settings?.check_in_time && <li>Check-in from {formatTime(settings.check_in_time)}</li>}
            {settings?.check_out_time && <li>Check-out by {formatTime(settings.check_out_time)}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800 px-6 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {hotelName}. All rights reserved.
      </div>
    </footer>
  );
}
