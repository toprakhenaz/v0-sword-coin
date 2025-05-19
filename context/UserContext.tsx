"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import {
  updateUserCoins,
  updateUserEnergy,
  upgradeBoost,
  useRocketBoost,
  useFullEnergyBoost,
  collectHourlyEarnings,
  getUserDailyCombo,
  findDailyComboCard,
} from "@/lib/db-actions"

interface TelegramUserData {
  id: string
  username: string
  first_name: string
  last_name?: string
  photo_url?: string
}

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
  isLevelingUp: boolean
  previousLeague: number | null
  dailyCombo: {
    cardIds: number[]
    foundCardIds: number[]
    reward: number
    isCompleted: boolean
  }
  boosts: {
    multiTouch: { level: number; cost: number }
    energyLimit: { level: number; cost: number }
    chargeSpeed: { level: number; cost: number }
    dailyRockets: number
    maxDailyRockets: number
    energyFullUsed: boolean
  }
  telegramUser: TelegramUserData | null
  isAuthenticated: boolean
  updateCoins: (amount: number, transactionType: string, description?: string) => Promise<void>
  updateEnergy: (amount: number) => Promise<void>
  refreshUserData: () => Promise<void>
  setLeague: (league: number) => void
  handleTap: () => Promise<void>
  collectHourlyEarnings: () => Promise<{ success: boolean; coins?: number; message?: string }>
  upgradeBoost: (boostType: string) => Promise<{ success: boolean; message?: string }>
  useRocketBoost: () => {
    result: { success: boolean; message?: string } | null
    isLoading: boolean
    handleRocketBoost: () => Promise<void>
  }
  useFullEnergyBoost: () => Promise<{ success: boolean; message?: string }>
  findComboCard: (cardIndex: number) => Promise<{
    success: boolean
    cardId?: number
    isCompleted?: boolean
    reward?: number
    message?: string
  }>
  setTelegramUser: (user: any) => void
  setDefaultUser: (user: any) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [telegramId, setTelegramId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
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
  const [comboCounter, setComboCounter] = useState(0)
  const [tapMultiplier, setTapMultiplier] = useState(1)
  const [telegramUser, setTelegramUserState] = useState<TelegramUserData | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dailyCombo, setDailyCombo] = useState({
    cardIds: [1, 2, 3],
    foundCardIds: [],
    reward: 100000,
    isCompleted: false,
  })
  const [boosts, setBoosts] = useState({
    multiTouch: { level: 1, cost: 2000 },
    energyLimit: { level: 1, cost: 2000 },
    chargeSpeed: { level: 1, cost: 2000 },
    dailyRockets: 3,
    maxDailyRockets: 3,
    energyFullUsed: false,
  })

  const [resultRocket, setResultRocket] = useState<{ success: boolean; message?: string } | null>(null)
  const [isLoadingRocket, setIsLoadingRocket] = useState(false)
  const [resultFullEnergy, setResultFullEnergy] = useState<{ success: boolean; message?: string } | null>(null)

  // Set Telegram user
  const setTelegramUser = useCallback((user: any) => {
    if (!user) return

    setTelegramUserState({
      id: user.telegram_id || user.id.toString(),
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      photo_url: user.photo_url,
    })

    setUserId(user.id)
    setTelegramId(user.telegram_id || user.id.toString())
    setUsername(user.username)
    setCoins(user.coins)
    setEnergy(user.energy)
    setMaxEnergy(user.max_energy)
    setEarnPerTap(user.earn_per_tap)
    setHourlyEarn(user.hourly_earn)
    setLeagueState(user.league)
    setLastEnergyUpdate(new Date(user.last_energy_regen))
    setIsAuthenticated(true)

    // Save to localStorage for session persistence
    localStorage.setItem("telegramUser", JSON.stringify(user))

    // Load user data
    refreshUserData()
  }, [])

  // Set default user (for guest login)
  const setDefaultUser = useCallback((user: any) => {
    if (!user) return

    setUserId(user.id)
    setTelegramId(null)
    setUsername(user.username)
    setCoins(user.coins)
    setEnergy(user.energy)
    setMaxEnergy(user.max_energy)
    setEarnPerTap(user.earn_per_tap)
    setHourlyEarn(user.hourly_earn)
    setLeagueState(user.league)
    setLastEnergyUpdate(new Date(user.last_energy_regen))
    setIsAuthenticated(true)

    // Save to localStorage for session persistence
    localStorage.setItem("defaultUser", JSON.stringify(user))

    // Load user data
    refreshUserData()
  }, [])

  // Logout function
  const logout = useCallback(() => {
    setTelegramUserState(null)
    setUserId(null)
    setTelegramId(null)
    setUsername(null)
    setIsAuthenticated(false)

    // Clear localStorage
    localStorage.removeItem("telegramUser")
    localStorage.removeItem("defaultUser")

    // Reset game state
    setCoins(0)
    setEnergy(0)
    setMaxEnergy(100)
    setEarnPerTap(1)
    setHourlyEarn(0)
    setLeagueState(1)
    setBoosts({
      multiTouch: { level: 1, cost: 2000 },
      energyLimit: { level: 1, cost: 2000 },
      chargeSpeed: { level: 1, cost: 2000 },
      dailyRockets: 3,
      maxDailyRockets: 3,
      energyFullUsed: false,
    })
  }, [])

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      try {
        // First check for telegram user
        const savedTelegramUser = localStorage.getItem("telegramUser")
        if (savedTelegramUser) {
          const user = JSON.parse(savedTelegramUser)

          // Verify the user exists in the database
          const { data: existingUser } = await supabase.from("users").select("*").eq("telegram_id", user.id).single()

          if (existingUser) {
            setTelegramUser(existingUser)
            setIsLoading(false)
            return
          } else {
            // User not found in database, clear localStorage
            localStorage.removeItem("telegramUser")
          }
        }

        // Then check for default user
        const savedDefaultUser = localStorage.getItem("defaultUser")
        if (savedDefaultUser) {
          const user = JSON.parse(savedDefaultUser)

          // Verify the user exists in the database
          const { data: existingUser } = await supabase.from("users").select("*").eq("id", user.id).single()

          if (existingUser) {
            setDefaultUser(existingUser)
            setIsLoading(false)
            return
          } else {
            // User not found in database, clear localStorage
            localStorage.removeItem("defaultUser")
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking session:", error)
        setIsLoading(false)
      }
    }

    checkSession()
  }, [setTelegramUser, setDefaultUser])

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

  // Auto regenerate energy based on time passed
  useEffect(() => {
    // Calculate energy to regenerate based on time passed since last update
    if (userId && energy < maxEnergy) {
      const now = new Date()
      const timeDiffMs = now.getTime() - lastEnergyUpdate.getTime()
      const minutesPassed = timeDiffMs / (1000 * 60)

      // Base regeneration: 1 energy per minute, modified by charge speed level
      const chargeMultiplier = 1 + (boosts.chargeSpeed.level - 1) * 0.2 // 20% increase per level
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
  }, [userId, energy, maxEnergy, lastEnergyUpdate, boosts.chargeSpeed.level])

  // Energy regeneration timer
  const updateEnergyHandler = useCallback(
    async (amount: number) => {
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
          await updateUserEnergy(userId, amount)
        } catch (error) {
          console.error("Error updating energy:", error)
          // Revert local state if database update fails
          setEnergy(energy)
        }

        return newEnergy
      }

      return energy
    },
    [userId, energy, maxEnergy],
  )

  useEffect(() => {
    let energyInterval: NodeJS.Timeout | null = null

    if (userId && energy < maxEnergy) {
      const chargeMultiplier = 1 + (boosts.chargeSpeed.level - 1) * 0.2 // 20% increase per level
      const regenTime = 60000 / chargeMultiplier // Adjust regen time based on charge speed

      energyInterval = setInterval(() => {
        updateEnergyHandler(1)
      }, regenTime) // Adjusted time
    }

    return () => {
      if (energyInterval) clearInterval(energyInterval)
    }
  }, [userId, energy, maxEnergy, boosts.chargeSpeed.level, updateEnergyHandler])

  // Combo system
  useEffect(() => {
    if (comboCounter > 0) {
      const comboTimeout = setTimeout(() => {
        setComboCounter(0)
        setTapMultiplier(1)
      }, 2000) // Reset combo after 2 seconds of inactivity

      return () => clearTimeout(comboTimeout)
    }
  }, [comboCounter])

  // Update coins in state and database
  const updateCoinsHandler = async (amount: number, transactionType: string, description?: string) => {
    if (!userId) return

    // Update local state
    const newCoins = coins + amount
    setCoins(newCoins)

    // Update in database
    await updateUserCoins(userId, amount, transactionType, description)

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
      setLeague(newLeague)
    }
  }

  // Handle tap action
  const handleTap = async () => {
    if (energy <= 0) return // Don't proceed if no energy

    // Immediately update UI state first for responsive feedback
    const newCombo = comboCounter + 1
    setComboCounter(newCombo)

    // Calculate tap multiplier
    let multiplier = 1
    if (newCombo > 50)
      multiplier = 3 // Max multiplier is 3x
    else if (newCombo > 25) multiplier = 2
    else if (newCombo > 10) multiplier = 1.5

    setTapMultiplier(multiplier)

    // Calculate coins to earn
    const coinsToEarn = Math.round(earnPerTap * multiplier)

    // Update coins and energy in parallel
    await Promise.all([
      updateCoinsHandler(coinsToEarn, "tap", `Earned from tapping (${multiplier}x combo)`),
      updateEnergyHandler(-1),
    ])
  }

  // Collect hourly earnings
  const collectHourlyEarningsHandler = useCallback(async () => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await collectHourlyEarnings(userId)

    if (result.success && result.coins) {
      setCoins(coins + result.coins)
      return { success: true, coins: result.coins }
    }

    return { success: false, message: result.message || "Failed to collect earnings" }
  }, [coins, userId])

  // Upgrade boost
  const upgradeBoostHandler = async (boostType: string) => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await upgradeBoost(userId, boostType)

    if (result.success) {
      // Update local state
      const updatedBoosts = { ...boosts }

      if (boostType === "multiTouch") {
        updatedBoosts.multiTouch.level = result.newLevel || boosts.multiTouch.level + 1
        updatedBoosts.multiTouch.cost = result.cost || Math.floor(boosts.multiTouch.cost * 1.5)
        setEarnPerTap(1 + (updatedBoosts.multiTouch.level - 1) * 2)
      } else if (boostType === "energyLimit") {
        updatedBoosts.energyLimit.level = result.newLevel || boosts.energyLimit.level + 1
        updatedBoosts.energyLimit.cost = result.cost || Math.floor(boosts.energyLimit.cost * 1.5)
        setMaxEnergy(100 + (updatedBoosts.energyLimit.level - 1) * 500)
      } else if (boostType === "chargeSpeed") {
        updatedBoosts.chargeSpeed.level = result.newLevel || boosts.chargeSpeed.level + 1
        updatedBoosts.chargeSpeed.cost = result.cost || Math.floor(boosts.energyLimit.cost * 1.5)
      }

      setBoosts(updatedBoosts)

      // Calculate cost based on boost type
      let cost = 0
      if (boostType === "multiTouch") {
        cost = boosts.multiTouch.cost
      } else if (boostType === "energyLimit") {
        cost = boosts.energyLimit.cost
      } else if (boostType === "chargeSpeed") {
        cost = boosts.chargeSpeed.cost
      }

      // Update coins
      setCoins(coins - cost)

      return { success: true }
    }

    return { success: false, message: result.message || "Failed to upgrade boost" }
  }

  // Use rocket boost
  const handleRocketBoost = useCallback(async () => {
    if (!userId || isLoadingRocket) return

    setIsLoadingRocket(true)
    try {
      const boostResult = await useRocketBoost(userId)
      setResultRocket(boostResult)

      if (boostResult.success) {
        // Update local state
        setBoosts({
          ...boosts,
          dailyRockets: boostResult.rocketsLeft || boosts.dailyRockets - 1,
        })
        setEnergy(Math.min(maxEnergy, energy + 500))
      }
    } finally {
      setIsLoadingRocket(false)
    }
  }, [boosts, energy, maxEnergy, userId, isLoadingRocket])

  const rocketBoost = useCallback(() => {
    return {
      result: resultRocket,
      isLoading: isLoadingRocket,
      handleRocketBoost,
    }
  }, [resultRocket, isLoadingRocket, handleRocketBoost])

  // Use full energy boost
  const useFullEnergyBoostHandler = useCallback(async () => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await useFullEnergyBoost(userId)
    setResultFullEnergy(result)

    if (result.success) {
      // Update local state
      setBoosts({
        ...boosts,
        energyFullUsed: true,
      })
      setEnergy(maxEnergy)

      return { success: true }
    }

    return { success: false, message: result.message || "Failed to use full energy boost" }
  }, [boosts, energy, maxEnergy, userId])

  const refreshUserData = async () => {
    try {
      if (!userId) return

      // Fetch user data
      const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single()

      if (userData) {
        setCoins(userData.coins)
        setEnergy(userData.energy)
        setMaxEnergy(userData.max_energy)
        setEarnPerTap(userData.earn_per_tap)
        setHourlyEarn(userData.hourly_earn)
        setLeagueState(userData.league)
        setLastEnergyUpdate(new Date(userData.last_energy_regen))
      }

      // Fetch user boosts
      const { data: userBoosts } = await supabase.from("user_boosts").select("*").eq("user_id", userId).single()

      if (userBoosts) {
        setBoosts({
          multiTouch: {
            level: userBoosts.multi_touch_level,
            cost: 2000 * Math.pow(1.5, userBoosts.multi_touch_level - 1),
          },
          energyLimit: {
            level: userBoosts.energy_limit_level,
            cost: 2000 * Math.pow(1.5, userBoosts.energy_limit_level - 1),
          },
          chargeSpeed: {
            level: userBoosts.charge_speed_level,
            cost: 2000 * Math.pow(1.5, userBoosts.charge_speed_level - 1),
          },
          dailyRockets: userBoosts.daily_rockets,
          maxDailyRockets: userBoosts.max_daily_rockets,
          energyFullUsed: userBoosts.energy_full_used,
        })
      }

      // Fetch daily combo
      const dailyComboData = await getUserDailyCombo(userId)
      if (dailyComboData) {
        setDailyCombo({
          cardIds: dailyComboData.card_ids,
          foundCardIds: dailyComboData.found_card_ids,
          reward: dailyComboData.reward,
          isCompleted: dailyComboData.is_completed,
        })
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
  }

  const findComboCardHandler = async (cardIndex: number) => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await findDailyComboCard(userId, cardIndex)

    if (result.success) {
      // Update local state
      const updatedDailyCombo = { ...dailyCombo }
      updatedDailyCombo.foundCardIds = result.foundCardIds || dailyCombo.foundCardIds
      updatedDailyCombo.isCompleted = result.isCompleted || dailyCombo.isCompleted

      setDailyCombo(updatedDailyCombo)
      refreshUserData()

      return {
        success: true,
        cardId: result.cardId,
        isCompleted: result.isCompleted,
        reward: result.reward,
      }
    }

    return { success: false, message: result.message || "Failed to find combo card" }
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
        dailyCombo,
        boosts,
        telegramUser,
        isAuthenticated,
        updateCoins: updateCoinsHandler,
        updateEnergy: updateEnergyHandler,
        refreshUserData,
        setLeague,
        handleTap,
        collectHourlyEarnings: collectHourlyEarningsHandler,
        upgradeBoost: upgradeBoostHandler,
        useRocketBoost: rocketBoost,
        useFullEnergyBoost: useFullEnergyBoostHandler,
        findComboCard: findComboCardHandler,
        setTelegramUser,
        setDefaultUser,
        logout,
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
