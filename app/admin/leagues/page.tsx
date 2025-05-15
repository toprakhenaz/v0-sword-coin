"use client"

import { useEffect, useState } from "react"
import { useSupabase } from "@/providers/SupabaseProvider"
import AdminLeagueList from "@/components/Admin/AdminLeagueList"
import AdminLogin from "@/components/Admin/AdminLogin"

export default function AdminLeaguesPage() {
  const { supabase } = useSupabase()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return

      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
      setLoading(false)
    }

    checkAuth()
  }, [supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return isAuthenticated ? <AdminLeagueList /> : <AdminLogin onLogin={() => setIsAuthenticated(true)} />
}
