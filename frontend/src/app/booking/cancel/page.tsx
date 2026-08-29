export default async function BookingCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold text-gray-900">Payment cancelled</h1>
      <p className="mt-2 text-gray-600">
        Your booking{ref ? ` (reference ${ref})` : ''} was not paid for and has not been confirmed. You
        can go back and try again anytime.
      </p>
    </div>
  );
}
