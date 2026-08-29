import { createClient } from '@supabase/supabase-js';

// Anon-key client — safe to use in Server Components and Route Handlers for
// public reads (active room types, hotel settings, availability RPC).
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
