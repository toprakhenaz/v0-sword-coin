import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

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

// Server-side Supabase client
export const createServerClient = () => {
  const cookieStore = cookies()

  return createClient(process.env.SUPABASE_URL || "", process.env.SUPABASE_ANON_KEY || "", {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Cookie: cookieStore.toString(),
      },
    },
  })
}

// For server components and server actions
export async function createServerSupabaseClient() {
  "use server"
  return createServerClient()
}
