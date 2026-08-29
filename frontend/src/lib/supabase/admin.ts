import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Service-role client — bypasses RLS. Only ever import this from Server
// Actions or Route Handlers (never from a Client Component). Used to create
// bookings/payments, which have no public insert policy in the database.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
