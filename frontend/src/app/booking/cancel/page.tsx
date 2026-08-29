import Link from 'next/link';

export default async function BookingCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-stone-900">Payment cancelled</h1>
      <p className="mt-2 text-stone-600">
        Your booking{ref ? ` (reference ${ref})` : ''} was not paid for and has not been confirmed. You
        can go back and try again anytime.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-900/20 transition hover:bg-amber-400"
      >
        Back to home
      </Link>
    </div>
  );
}
