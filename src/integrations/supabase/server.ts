/**
 * Server-side Supabase client for metadata generation
 * Used in Next.js Server Components and generateMetadata functions
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let supabaseClientInstance: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Get Supabase environment variables
 * Returns null if variables are missing (for graceful handling during build)
 */
function getSupabaseConfig() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return { url: SUPABASE_URL, key: SUPABASE_ANON_KEY };
}

/**
 * Get or create the Supabase client instance
 * Returns null if env vars are missing (for graceful handling during build)
 */
function getSupabaseClient(): ReturnType<typeof createClient<Database>> | null {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  supabaseClientInstance = createClient<Database>(config.url, config.key);
  return supabaseClientInstance;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

/**
 * Server-side Supabase client
 * Use this in Server Components and generateMetadata functions
 * Returns null if env vars are missing (check with isSupabaseConfigured first)
 * 
 * This uses a Proxy to lazily initialize the client only when accessed
 */
export const supabaseServer = new Proxy({} as ReturnType<typeof createClient<Database>>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a no-op function/object that won't break the code
      if (prop === "from") {
        return () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            or: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
            }),
          }),
        });
      }
      // For other properties, return a function that returns null/empty
      return () => null;
    }
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
}) as ReturnType<typeof createClient<Database>>;

