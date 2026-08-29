import { createBrowserClient } from '@supabase/ssr';

// Not typed against a generated Database schema — see cms/README.md for why.
// Query results are cast to the domain types in `@/types/database` at call sites.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
