import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Not typed against a generated Database schema — see cms/README.md for why.
// Query results are cast to the domain types in `@/types/database` at call sites.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component; safe to ignore because the
            // middleware refreshes the session on every request anyway.
          }
        },
      },
    }
  );
}
