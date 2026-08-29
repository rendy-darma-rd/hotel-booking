import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './settings-form';
import type { HotelSettings } from '@/types/database';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from('hotel_settings').select('*').eq('id', true).single();
  const settings = data as HotelSettings;

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-gray-900">Hotel Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
