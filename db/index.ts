import { createClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/supabase"

// This is a wrapper to provide database access
// We're replacing Prisma with Supabase since Prisma isn't supported in v0

// For server components and API routes
export const getServerDb = () => {
  return getSupabaseServerClient()
}

// For client components (if needed)
export const getClientDb = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Default export for backward compatibility
export default {
  getServerDb,
  getClientDb,
}
