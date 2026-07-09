import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Strip accidental /rest/v1 suffix — the JS client adds that itself. */
function normalizeSupabaseUrl(url: string) {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { url: normalizeSupabaseUrl(url), anonKey };
}

/**
 * Browser Supabase client — import this from client components and hooks.
 * Call only in the browser (event handlers, useEffect).
 *
 * ```ts
 * import { createClient } from "@/lib/supabase";
 * const supabase = createClient();
 * ```
 */
export function createClient() {
  if (typeof window === "undefined") {
    throw new Error("createClient() must be called in the browser");
  }

  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig();
    browserClient = createBrowserClient<Database>(url, anonKey);
  }
  return browserClient;
}

/**
 * Server-side service-role client for API routes and server actions.
 * Bypasses RLS — never import this into client components.
 *
 * Requires `SUPABASE_SERVICE_ROLE_KEY` in env (not prefixed with NEXT_PUBLIC_).
 *
 * ```ts
 * import { createServiceClient } from "@/lib/supabase";
 * const supabase = createServiceClient();
 * ```
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createSupabaseClient<Database>(normalizeSupabaseUrl(url), serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
