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
  isLevelingUp: boolean // Yeni: Seviye atlama animasyonu için
  previousLeague: number | null // Yeni: Önceki seviyeyi takip etmek için
  updateCoins: (amount: number, transactionType: string, description?: string) => Promise<void>
  updateEnergy: (amount: number) => Promise<void>
  refreshUserData: () => Promise<void>
  setLeague: (league: number) => void // Yeni: Seviyeyi manuel olarak ayarlamak için
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
  const [league, setLeagueState] = useState(1)
  const [previousLeague, setPreviousLeague] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const [lastEnergyUpdate, setLastEnergyUpdate] = useState<Date>(new Date())

  // Seviyeyi değiştirmek için fonksiyon
  const setLeague = (newLeague: number) => {
    if (newLeague !== league) {
      try {
        setPreviousLeague(league)
        setIsLevelingUp(true)

        // Update database if userId exists
        if (userId) {
          supabase
            .from("users")
            .update({
              league: newLeague,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
            .then(({ error }) => {
              if (error) console.error("Error updating league in database:", error)
            })
        }

        // Delay state update for animation
        setTimeout(() => {
          setLeagueState(newLeague)

          // End animation after transition
          setTimeout(() => {
            setIsLevelingUp(false)
          }, 1000)
        }, 500)
      } catch (error) {
        console.error("Error setting league:", error)
        setIsLevelingUp(false)
      }
    }
  }

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
          setLeagueState(existingUser.league)
          setLastEnergyUpdate(new Date(existingUser.last_energy_regen))
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
                last_energy_regen: new Date().toISOString(),
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
            setLeagueState(newUser.league)
            setLastEnergyUpdate(new Date())

            // Create initial boosts
            await supabase.from("user_boosts").insert([
              {
                user_id: newUser.id,
                multi_touch_level: 1,
                energy_limit_level: 1,
                charge_speed_level: 1,
                daily_rockets: 3,
                max_daily_rockets: 3,
                energy_full_used: false,
              },
            ])
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

  // Auto regenerate energy based on time passed
  useEffect(() => {
    // Calculate energy to regenerate based on time passed since last update
    if (userId && energy < maxEnergy) {
      const now = new Date()
      const timeDiffMs = now.getTime() - lastEnergyUpdate.getTime()
      const minutesPassed = timeDiffMs / (1000 * 60)

      // Base regeneration: 1 energy per minute, modified by charge speed level
      const chargeMultiplier = 1 // This should be based on the charge_speed_level
      const energyToAdd = Math.floor(minutesPassed * chargeMultiplier)

      if (energyToAdd > 0) {
        const newEnergy = Math.min(maxEnergy, energy + energyToAdd)
        setEnergy(newEnergy)
        setLastEnergyUpdate(now)

        // Update in database
        supabase
          .from("users")
          .update({
            energy: newEnergy,
            last_energy_regen: now.toISOString(),
          })
          .eq("id", userId)
          .then(() => {
            console.log("Energy updated based on time passed")
          })
          .catch((error) => {
            console.error("Error updating energy:", error)
          })
      }
    }
  }, [userId, energy, maxEnergy, lastEnergyUpdate])

  // Energy regeneration timer
  useEffect(() => {
    let energyInterval: NodeJS.Timeout | null = null

    if (userId && energy < maxEnergy) {
      energyInterval = setInterval(() => {
        updateEnergy(1)
      }, 60000) // 1 minute
    }

    return () => {
      if (energyInterval) clearInterval(energyInterval)
    }
  }, [userId, energy, maxEnergy])

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

    // Check if user should be promoted to next league
    if (amount > 0) {
      checkAndUpdateLeague(newCoins)
    }
  }

  // Check and update league based on coin count
  const checkAndUpdateLeague = async (coinCount: number) => {
    if (!userId) return

    // Define league thresholds in a more structured way
    const leagueThresholds = [
      { level: 1, name: "Wooden", threshold: 0 },
      { level: 2, name: "Bronze", threshold: 10000 },
      { level: 3, name: "Iron", threshold: 100000 },
      { level: 4, name: "Steel", threshold: 1000000 },
      { level: 5, name: "Adamantite", threshold: 10000000 },
      { level: 6, name: "Legendary", threshold: 100000000 },
      { level: 7, name: "Dragon", threshold: 1000000000 },
    ]

    // Determine new league
    let newLeague = 1
    for (let i = leagueThresholds.length - 1; i >= 0; i--) {
      if (coinCount >= leagueThresholds[i].threshold) {
        newLeague = leagueThresholds[i].level
        break
      }
    }

    // Only update if league has changed and is higher than current league
    if (newLeague > league) {
      try {
        // Set animation state first
        setPreviousLeague(league)
        setIsLevelingUp(true)

        // Update database
        const { error } = await supabase
          .from("users")
          .update({
            league: newLeague,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (error) {
          console.error("Error updating league:", error)
          setIsLevelingUp(false)
          return
        }

        // Update state after a short delay for animation
        setTimeout(() => {
          setLeagueState(newLeague)

          // End animation after transition completes
          setTimeout(() => {
            setIsLevelingUp(false)
          }, 1000)
        }, 500)
      } catch (error) {
        console.error("Error in league promotion:", error)
        setIsLevelingUp(false)
      }
    }
  }

  // Update energy in state and database
  const updateEnergy = async (amount: number) => {
    if (!userId) return

    // Calculate new energy (ensure it doesn't go below 0 or above max)
    const newEnergy = Math.max(0, Math.min(maxEnergy, energy + amount))

    // Only update if energy changed
    if (newEnergy !== energy) {
      // Update local state immediately for responsive UI
      setEnergy(newEnergy)
      setLastEnergyUpdate(new Date())

      // Update in database (don't await this to keep UI responsive)
      try {
        await supabase
          .from("users")
          .update({
            energy: newEnergy,
            last_energy_regen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
      } catch (error) {
        console.error("Error updating energy:", error)
        // Revert local state if database update fails
        setEnergy(energy)
      }

      return newEnergy
    }

    return energy
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

      // Eğer lig değiştiyse, animasyonla güncelle
      if (user.league !== league) {
        setLeague(user.league)
      } else {
        setLeagueState(user.league)
      }

      setLastEnergyUpdate(new Date(user.last_energy_regen))
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
        isLevelingUp,
        previousLeague,
        updateCoins,
        updateEnergy,
        refreshUserData,
        setLeague,
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
