'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updateHotelSettings } from './actions';
import type { HotelSettings } from '@/types/database';

const initialState: { error: string | null } = { error: null };

export function SettingsForm({ settings }: { settings: HotelSettings }) {
  const [state, formAction, pending] = useActionState(updateHotelSettings, initialState);
  const showSaved = !pending && state !== initialState && state.error === null;

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label htmlFor="hotel_name" className="block text-sm font-medium text-gray-700">
          Hotel name
        </label>
        <input
          id="hotel_name"
          name="hotel_name"
          required
          defaultValue={settings.hotel_name}
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
          defaultValue={settings.description ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <input
          id="address"
          name="address"
          defaultValue={settings.address ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={settings.phone ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Contact email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={settings.email ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="check_in_time" className="block text-sm font-medium text-gray-700">
            Check-in time
          </label>
          <input
            id="check_in_time"
            name="check_in_time"
            type="time"
            defaultValue={settings.check_in_time}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="check_out_time" className="block text-sm font-medium text-gray-700">
            Check-out time
          </label>
          <input
            id="check_out_time"
            name="check_out_time"
            type="time"
            defaultValue={settings.check_out_time}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {showSaved && <p className="text-sm text-green-600">Saved.</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="cursor-pointer rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save settings'}
        </button>
        <Link
          href="/"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
