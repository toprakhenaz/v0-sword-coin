"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { checkAuth } from "@/app/actions/auth-actions"
import { updateUserCoins, updateUserEnergy, getUserDailyCombo } from "@/lib/db-actions"

type UserContextType = {
  userId: string | null
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
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [coins, setCoins] = useState(1000)
  const [energy, setEnergy] = useState(100)
  const [maxEnergy, setMaxEnergy] = useState(100)
  const [earnPerTap, setEarnPerTap] = useState(1)
  const [hourlyEarn, setHourlyEarn] = useState(10)
  const [league, setLeagueState] = useState(1)
  const [previousLeague, setPreviousLeague] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLevelingUp, setIsLevelingUp] = useState(false)
  const [lastEnergyUpdate, setLastEnergyUpdate] = useState<Date>(new Date())
  const [comboCounter, setComboCounter] = useState(0)
  const [tapMultiplier, setTapMultiplier] = useState(1)
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

  // Check for user in localStorage on load
  useEffect(() => {
    const checkUser = () => {
      try {
        const savedUser = localStorage.getItem("demo_user")
        if (savedUser) {
          const user = JSON.parse(savedUser)
          setUserId(user.id)
          setUsername(user.username)
          setCoins(user.coins || 1000)
          setEnergy(user.energy || 100)
          setMaxEnergy(user.max_energy || 100)
          setLeagueState(user.league || 1)
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking user:", error)
        setIsLoading(false)
      }
    }

    checkUser()
  }, [])

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

  const [telegramId, setTelegramId] = useState<string | null>(null)

  // Check authentication and initialize user data
  useEffect(() => {
    const initUser = async () => {
      try {
        // First, check authentication
        const { authenticated, userId: authUserId, telegramId: authTelegramId } = await checkAuth()

        if (!authenticated) {
          // Redirect to login if not authenticated
          router.push("/login")
          return
        }

        // Set user ID and Telegram ID from authentication
        setUserId(authUserId || null)
        setTelegramId(authTelegramId || null)

        // Seed the database if needed
        await fetch("/api/seed")

        // Fetch user data
        if (authUserId) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", authUserId)
            .single()

          if (userError) {
            console.error("Error fetching user data:", userError)
            setIsLoading(false)
            return
          }

          // Set user data
          setUsername(userData.username)
          setCoins(userData.coins)
          setEnergy(userData.energy)
          setMaxEnergy(userData.max_energy)
          setEarnPerTap(userData.earn_per_tap)
          setHourlyEarn(userData.hourly_earn)
          setLeagueState(userData.league)
          setLastEnergyUpdate(new Date(userData.last_energy_regen))

          // Load user boosts
          const { data: userBoosts } = await supabase.from("user_boosts").select("*").eq("user_id", authUserId).single()

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

          // Load daily combo
          const dailyComboData = await getUserDailyCombo(authUserId)
          if (dailyComboData) {
            setDailyCombo({
              cardIds: dailyComboData.card_ids,
              foundCardIds: dailyComboData.found_card_ids,
              reward: dailyComboData.reward,
              isCompleted: dailyComboData.is_completed,
            })
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error initializing user:", error)
        setIsLoading(false)
      }
    }

    initUser()
  }, [router])

  // Auto regenerate energy based on time passed
  useEffect(() => {
    // Calculate energy to regenerate based on time passed since last update
    if (energy < maxEnergy) {
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
      }
    }
  }, [energy, maxEnergy, lastEnergyUpdate, boosts.chargeSpeed.level])

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

    if (energy < maxEnergy) {
      const chargeMultiplier = 1 + (boosts.chargeSpeed.level - 1) * 0.2 // 20% increase per level
      const regenTime = 60000 / chargeMultiplier // Adjust regen time based on charge speed

      energyInterval = setInterval(() => {
        updateEnergyHandler(1)
      }, regenTime) // Adjusted time
    }

    return () => {
      if (energyInterval) clearInterval(energyInterval)
    }
  }, [energy, maxEnergy, boosts.chargeSpeed.level, updateEnergyHandler])

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

    // Update in localStorage
    try {
      const savedUser = localStorage.getItem("demo_user")
      if (savedUser) {
        const user = JSON.parse(savedUser)
        user.coins = newCoins
        localStorage.setItem("demo_user", JSON.stringify(user))
      }
    } catch (error) {
      console.error("Error updating coins:", error)
    }

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
    // Simulate hourly earnings
    const earningsAmount = hourlyEarn
    await updateCoinsHandler(earningsAmount, "hourly", "Hourly earnings")
    return { success: true, coins: earningsAmount }
  }, [hourlyEarn])

  // Upgrade boost
  const upgradeBoostHandler = async (boostType: string) => {
    // Determine which boost to upgrade and calculate cost
    let boostField = ""
    let currentLevel = 1
    let cost = 0

    if (boostType === "multiTouch") {
      boostField = "multiTouch"
      currentLevel = boosts.multiTouch.level
      cost = boosts.multiTouch.cost
    } else if (boostType === "energyLimit") {
      boostField = "energyLimit"
      currentLevel = boosts.energyLimit.level
      cost = boosts.energyLimit.cost
    } else if (boostType === "chargeSpeed") {
      boostField = "chargeSpeed"
      currentLevel = boosts.chargeSpeed.level
      cost = boosts.chargeSpeed.cost
    } else {
      return { success: false, message: "Invalid boost type" }
    }

    // Check if user has enough coins
    if (coins < cost) {
      return { success: false, message: "Not enough coins" }
    }

    // Update boost level
    const newLevel = currentLevel + 1
    const updatedBoosts = { ...boosts }

    if (boostType === "multiTouch") {
      updatedBoosts.multiTouch.level = newLevel
      updatedBoosts.multiTouch.cost = Math.floor(cost * 1.5)
      setEarnPerTap(1 + (newLevel - 1) * 2)
    } else if (boostType === "energyLimit") {
      updatedBoosts.energyLimit.level = newLevel
      updatedBoosts.energyLimit.cost = Math.floor(cost * 1.5)
      setMaxEnergy(100 + (newLevel - 1) * 500)
    } else if (boostType === "chargeSpeed") {
      updatedBoosts.chargeSpeed.level = newLevel
      updatedBoosts.chargeSpeed.cost = Math.floor(cost * 1.5)
    }

    setBoosts(updatedBoosts)

    // Calculate cost based on boost type
    /*let cost = 0
    if (boostType === "multiTouch") {
      cost = boosts.multiTouch.cost
    } else if (boostType === "energyLimit") {
      cost = boosts.energyLimit.cost
    } else if (boostType === "chargeSpeed") {
      cost = boosts.chargeSpeed.cost
    }*/

    // Update coins
    await updateCoinsHandler(-cost, "boost_upgrade", `Upgraded ${boostType} to level ${newLevel}`)

    return { success: true }
  }

  // Use rocket boost
  const [resultRocket, setResultRocket] = useState<{ success: boolean; message?: string } | null>(null)
  const [isLoadingRocket, setIsLoadingRocket] = useState(false)

  const handleRocketBoost = useCallback(async () => {
    if (isLoadingRocket) return

    setIsLoadingRocket(true)
    try {
      // Check if user has rockets left
      if (boosts.dailyRockets <= 0) {
        setResultRocket({ success: false, message: "No rockets left for today" })
        return
      }

      // Update rockets count
      setBoosts({
        ...boosts,
        dailyRockets: boosts.dailyRockets - 1,
      })

      // Add energy
      await updateEnergyHandler(500)

      setResultRocket({ success: true })
    } finally {
      setIsLoadingRocket(false)
    }
  }, [boosts, isLoadingRocket, updateEnergyHandler])

  const rocketBoost = () => {
    return {
      result: resultRocket,
      isLoading: isLoadingRocket,
      handleRocketBoost,
    }
  }

  const [resultFullEnergy, setResultFullEnergy] = useState<{ success: boolean; message?: string } | null>(null)

  // Use full energy boost
  const useFullEnergyBoostHandler = useCallback(async () => {
    // Check if boost already used
    if (boosts.energyFullUsed) {
      return { success: false, message: "Full energy boost already used today" }
    }

    // Update boost usage
    setBoosts({
      ...boosts,
      energyFullUsed: true,
    })

    // Set energy to max
    await updateEnergyHandler(maxEnergy - energy)

    return { success: true }
  }, [boosts, energy, maxEnergy, updateEnergyHandler])

  const refreshUserData = async () => {
    // For demo purposes, just refresh from localStorage
    try {
      const savedUser = localStorage.getItem("demo_user")
      if (savedUser) {
        const user = JSON.parse(savedUser)
        setCoins(user.coins || coins)
        setEnergy(user.energy || energy)
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
    }
  }

  const findComboCardHandler = async (cardIndex: number) => {
    // Check if card index is valid
    if (cardIndex < 0 || cardIndex >= dailyCombo.cardIds.length) {
      return { success: false, message: "Invalid card index" }
    }

    // Get the card ID at the specified index
    const cardId = dailyCombo.cardIds[cardIndex]

    // Check if card is already found
    if (dailyCombo.foundCardIds.includes(cardId)) {
      return { success: false, message: "Card already found" }
    }

    // Add card to found cards
    const foundCardIds = [...dailyCombo.foundCardIds, cardId]
    const isCompleted = foundCardIds.length === dailyCombo.cardIds.length

    // Update daily combo
    setDailyCombo({
      ...dailyCombo,
      foundCardIds,
      isCompleted,
    })

    // If combo is completed, add reward to user
    if (isCompleted) {
      await updateCoinsHandler(dailyCombo.reward, "daily_combo", "Completed daily combo")

      return {
        success: true,
        cardId,
        foundCardIds,
        isCompleted,
        reward: dailyCombo.reward,
      }
    }

    return {
      success: true,
      cardId,
      foundCardIds,
      isCompleted,
    }
  }

  // Logout function
  const handleLogout = async () => {
    localStorage.removeItem("demo_user")
    setUserId(null)
    setUsername(null)
    router.push("/login")
  }

  return (
    <UserContext.Provider
      value={{
        userId,
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
        logout: handleLogout,
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
