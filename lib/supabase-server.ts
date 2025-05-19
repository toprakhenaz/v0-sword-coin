import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

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
