import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client
export const createServerClient = () => {
  try {
    const cookieStore = cookies()

    // Supabase URL ve anahtar kontrolü
    const supabaseUrl = process.env.SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase URL veya anahtar bulunamadı:", {
        urlExists: !!supabaseUrl,
        keyExists: !!supabaseKey,
      })
      throw new Error("Supabase yapılandırması eksik")
    }

    console.log("Supabase server client oluşturuluyor")

    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          Cookie: cookieStore.toString(),
        },
      },
    })
  } catch (error) {
    console.error("Supabase server client oluşturma hatası:", error)
    throw error
  }
}
