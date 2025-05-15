"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { ReactNode } from "react"

type SupabaseContextType = {
  supabase: SupabaseClient | null
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
})

export const useSupabase = () => useContext(SupabaseContext)

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

    if (supabaseUrl && supabaseAnonKey) {
      const client = createClient(supabaseUrl, supabaseAnonKey)
      setSupabase(client)
    } else {
      console.error("Supabase URL or Anon Key is missing")
    }
  }, [])

  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>
}

// Add default export
export default SupabaseProvider
