"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

// For demo purposes, we'll use a hardcoded user ID
// In a real Telegram app, you would get this from the Telegram WebApp
const DEMO_TELEGRAM_ID = "123456789"
const DEMO_USERNAME = "demo_user"

type UserContextType = {
  userId: string | null
  telegramId: string | null
  username: string | null
  coins: number
  energy: number
  maxEnergy: number
  earnPerTap: number
  hourlyEarn: number
  league: number
  isLoading: boolean
  updateCoins: (amount: number, transactionType: string, description?: string) => Promise<void>
  updateEnergy: (amount: number) => Promise<void>
  refreshUserData: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [telegramId, setTelegramId] = useState<string | null>(DEMO_TELEGRAM_ID)
  const [username, setUsername] = useState<string | null>(DEMO_USERNAME)
  const [coins, setCoins] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [maxEnergy, setMaxEnergy] = useState(100)
  const [earnPerTap, setEarnPerTap] = useState(1)
  const [hourlyEarn, setHourlyEarn] = useState(0)
  const [league, setLeague] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize user data
  useEffect(() => {
    const initUser = async () => {
      try {
        // First, seed the database if needed
        await fetch("/api/seed")

        // Check if user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", DEMO_TELEGRAM_ID)
          .single()

        if (existingUser) {
          // User exists, load their data
          setUserId(existingUser.id)
          setCoins(existingUser.coins)
          setEnergy(existingUser.energy)
          setMaxEnergy(existingUser.max_energy)
          setEarnPerTap(existingUser.earn_per_tap)
          setHourlyEarn(existingUser.hourly_earn)
          setLeague(existingUser.league)
        } else {
          // Create new user
          const { data: newUser } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: DEMO_TELEGRAM_ID,
                username: DEMO_USERNAME,
                coins: 1000,
                league: 1,
                hourly_earn: 10,
                earn_per_tap: 1,
                energy: 100,
                max_energy: 100,
              },
            ])
            .select()
            .single()

          if (newUser) {
            setUserId(newUser.id)
            setCoins(newUser.coins)
            setEnergy(newUser.energy)
            setMaxEnergy(newUser.max_energy)
            setEarnPerTap(newUser.earn_per_tap)
            setHourlyEarn(newUser.hourly_earn)
            setLeague(newUser.league)

            // Create initial boosts
            await supabase.from("user_boosts").insert([{ user_id: newUser.id }])
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing user:", error)
        setIsLoading(false)
      }
    }

    initUser()
  }, [])

  // Update coins in state and database
  const updateCoins = async (amount: number, transactionType: string, description?: string) => {
    if (!userId) return

    // Update local state
    const newCoins = coins + amount
    setCoins(newCoins)

    // Update in database
    await supabase
      .from("users")
      .update({
        coins: newCoins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    // Log transaction
    await supabase.from("transactions").insert([
      {
        user_id: userId,
        amount,
        transaction_type: transactionType,
        description,
      },
    ])
  }

  // Update energy in state and database
  const updateEnergy = async (amount: number) => {
    if (!userId) return

    // Calculate new energy (ensure it doesn't go below 0 or above max)
    const newEnergy = Math.max(0, Math.min(maxEnergy, energy + amount))
    setEnergy(newEnergy)

    // Update in database
    await supabase
      .from("users")
      .update({
        energy: newEnergy,
        last_energy_regen: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
  }

  // Refresh user data from database
  const refreshUserData = async () => {
    if (!userId) return

    const { data: user } = await supabase.from("users").select("*").eq("id", userId).single()

    if (user) {
      setCoins(user.coins)
      setEnergy(user.energy)
      setMaxEnergy(user.max_energy)
      setEarnPerTap(user.earn_per_tap)
      setHourlyEarn(user.hourly_earn)
      setLeague(user.league)
    }
  }

  return (
    <UserContext.Provider
      value={{
        userId,
        telegramId,
        username,
        coins,
        energy,
        maxEnergy,
        earnPerTap,
        hourlyEarn,
        league,
        isLoading,
        updateCoins,
        updateEnergy,
        refreshUserData,
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
