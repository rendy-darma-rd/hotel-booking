import Link from 'next/link';

export function SiteHeader({ hotelName }: { hotelName: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-stone-900">
          {hotelName}
        </Link>
        <Link
          href="/#rooms"
          className="rounded-full border border-stone-300 px-4 py-1.5 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
        >
          Our Rooms
        </Link>
      </div>
    </header>
  );
}
