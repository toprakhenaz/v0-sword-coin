"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

type User = {
  id: string
  username: string
  coins: number
  crystals: number
  earnPerTap: number
  energy: number
  maxEnergy: number
  league: number
  lastActive: string
  referralCode: string
}

interface UserContextType {
  user: User | null
  loading: boolean
  updateUser: (data: Partial<User>) => Promise<void>
  addCoins: (amount: number) => Promise<void>
  addCrystals: (amount: number) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (error) throw error

          setUser(userData)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const { data: userData, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (!error) {
          setUser(userData)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase, router])

  const updateUser = async (data: Partial<User>) => {
    if (!user) return

    try {
      const { error } = await supabase.from("users").update(data).eq("id", user.id)

      if (error) throw error

      setUser((prev) => (prev ? { ...prev, ...data } : null))
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user data",
        variant: "destructive",
      })
    }
  }

  const addCoins = async (amount: number) => {
    if (!user) return

    try {
      const newCoins = user.coins + amount
      const { error } = await supabase.from("users").update({ coins: newCoins }).eq("id", user.id)

      if (error) throw error

      setUser((prev) => (prev ? { ...prev, coins: newCoins } : null))
    } catch (error) {
      console.error("Error adding coins:", error)
      toast({
        title: "Error",
        description: "Failed to add coins",
        variant: "destructive",
      })
    }
  }

  const addCrystals = async (amount: number) => {
    if (!user) return

    try {
      const newCrystals = user.crystals + amount
      const { error } = await supabase.from("users").update({ crystals: newCrystals }).eq("id", user.id)

      if (error) throw error

      setUser((prev) => (prev ? { ...prev, crystals: newCrystals } : null))
    } catch (error) {
      console.error("Error adding crystals:", error)
      toast({
        title: "Error",
        description: "Failed to add crystals",
        variant: "destructive",
      })
    }
  }

  const refreshUser = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error) throw error

      setUser(data)
    } catch (error) {
      console.error("Error refreshing user:", error)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        updateUser,
        addCoins,
        addCrystals,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
