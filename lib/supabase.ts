import { createClient } from "@supabase/supabase-js"

// Environment variables are already available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a singleton instance for client components
let supabaseInstance: ReturnType<typeof createClient> | null = null

// Client-side Supabase client (singleton pattern)
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseInstance
})()

// Server-side Supabase client creation is moved to a separate file
// to avoid importing next/headers in client components
