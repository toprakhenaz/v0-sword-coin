"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from "react"
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

// Telegram WebApp integration
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code: string
          }
        }
      }
    }
  }
}

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
  updateCoins: (amount: number, transactionType: string, description?: string) => Promise<boolean>
  updateEnergy: (amount: number) => Promise<void>
  refreshUserData: () => Promise<void>
  setLeague: (league: number) => void
  handleTap: () => Promise<void>
  collectHourlyEarnings: () => () => Promise<{ success: boolean; coins?: number; message?: string }>
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

  // Rocket boost states
  const [resultRocket, setResultRocket] = useState<{ success: boolean; message?: string } | null>(null)
  const [isLoadingRocket, setIsLoadingRocket] = useState(false)

  // Full energy boost state
  const [fullEnergyBoostResult, setFullEnergyBoostResult] = useState<{ success: boolean; message?: string } | null>(
    null,
  )

  // Debounce and rate limiting
  const energyUpdateQueue = useRef<number>(0)
  const isUpdatingEnergy = useRef<boolean>(false)
  const energyUpdateTimer = useRef<NodeJS.Timeout | null>(null)

  // Coin update queue and debouncing
  const coinUpdateQueue = useRef<{ amount: number; transactionType: string; description?: string }[]>([])
  const isUpdatingCoins = useRef<boolean>(false)
  const coinUpdateTimer = useRef<NodeJS.Timeout | null>(null)

  const lastTapTime = useRef<number>(0)
  const tapCooldown = 300 // ms between taps to prevent too many requests (increased from 200ms)

  // Seviyeyi değiştirmek için fonksiyon
  const setLeague = (newLeague: number) => {
    if (newLeague !== league) {
      try {
        setPreviousLeague(league)
        setIsLevelingUp(true)

        // Calculate league progression benefits
        // - Higher league means higher earnings per tap and more max energy
        const newEarnPerTap = Math.max(1, Math.floor(newLeague * 1.5))
        const newMaxEnergy = Math.max(100, 100 + (newLeague - 1) * 50)

        // Update database if userId exists
        if (userId) {
          supabase
            .from("users")
            .update({
              league: newLeague,
              earn_per_tap: newEarnPerTap,
              max_energy: newMaxEnergy,
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
          setEarnPerTap(newEarnPerTap)
          setMaxEnergy(newMaxEnergy)

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

        // Get user ID from Telegram WebApp
        let telegramUserId = null
        let telegramUsername = null

        if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp.initDataUnsafe.user) {
          telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString()
          telegramUsername =
            window.Telegram.WebApp.initDataUnsafe.user.username ||
            `${window.Telegram.WebApp.initDataUnsafe.user.first_name || ""} ${window.Telegram.WebApp.initDataUnsafe.user.last_name || ""}`.trim()
        }

        // Fallback for development testing
        if (!telegramUserId) {
          telegramUserId = "123456789"
          telegramUsername = "dev_user"
          console.warn("Using development Telegram user ID and username")
        }

        setTelegramId(telegramUserId)
        setUsername(telegramUsername)

        // Check if user exists
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUserId)
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

          // Load user boosts
          const { data: userBoosts } = await supabase
            .from("user_boosts")
            .select("*")
            .eq("user_id", existingUser.id)
            .single()

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
          const dailyComboData = await getUserDailyCombo(existingUser.id)
          if (dailyComboData) {
            setDailyCombo({
              cardIds: dailyComboData.card_ids,
              foundCardIds: dailyComboData.found_card_ids,
              reward: dailyComboData.reward,
              isCompleted: dailyComboData.is_completed,
            })
          }
        } else {
          // Create new user
          const { data: newUser } = await supabase
            .from("users")
            .insert([
              {
                telegram_id: telegramUserId,
                username: telegramUsername,
                coins: 1000,
                league: 1,
                hourly_earn: 10,
                earn_per_tap: 1,
                energy: 100,
                max_energy: 100,
                last_energy_regen: new Date().toISOString(),
                last_hourly_collect: new Date().toISOString(),
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

            // Create initial daily combo
            const dailyComboData = await getUserDailyCombo(newUser.id)
            if (dailyComboData) {
              setDailyCombo({
                cardIds: dailyComboData.card_ids,
                foundCardIds: dailyComboData.found_card_ids,
                reward: dailyComboData.reward,
                isCompleted: dailyComboData.is_completed,
              })
            }
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

  // Add this effect to ensure hourly earnings are properly tracked and updated
  useEffect(() => {
    const calculateHourlyEarningsForCards = async () => {
      if (!userId) return

      try {
        // Get all user items
        const { data: userItems } = await supabase.from("user_items").select("hourly_income").eq("user_id", userId)

        if (userItems) {
          const calculatedHourlyEarn = userItems.reduce((total, item) => total + item.hourly_income, 0)

          // Update the state if different
          if (calculatedHourlyEarn !== hourlyEarn) {
            setHourlyEarn(calculatedHourlyEarn)

            // Update in the database if needed
            await supabase
              .from("users")
              .update({
                hourly_earn: calculatedHourlyEarn,
                updated_at: new Date().toISOString(),
              })
              .eq("id", userId)
          }
        }
      } catch (error) {
        console.error("Error calculating hourly earnings:", error)
      }
    }

    if (userId) {
      calculateHourlyEarningsForCards()
    }
  }, [userId, hourlyEarn])

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

        // Update in database - but don't wait for it to complete
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

  // Process energy update queue with debouncing
  const processEnergyUpdateQueue = useCallback(async () => {
    if (!userId || isUpdatingEnergy.current || energyUpdateQueue.current === 0) return

    isUpdatingEnergy.current = true
    try {
      const amount = energyUpdateQueue.current
      energyUpdateQueue.current = 0 // Reset the queue

      // Calculate new energy locally
      const newEnergy = Math.max(0, Math.min(maxEnergy, energy + amount))

      // Only update if energy changed
      if (newEnergy !== energy) {
        // Update local state immediately
        setEnergy(newEnergy)
        setLastEnergyUpdate(new Date())

        try {
          // Try to update in database
          const result = await updateUserEnergy(userId, amount)

          // If we got a null result but no error was thrown, it means we hit rate limiting
          // In this case, we'll keep our local value and try to sync later
          if (result === null) {
            console.warn("Energy update may have been rate limited. Using local value.")

            // Schedule a sync attempt for later
            setTimeout(() => {
              supabase
                .from("users")
                .update({
                  energy: newEnergy,
                  last_energy_regen: new Date().toISOString(),
                })
                .eq("id", userId)
                .then(() => console.log("Delayed energy sync successful"))
                .catch((err) => console.error("Delayed energy sync failed:", err))
            }, 5000) // Try again in 5 seconds
          }
        } catch (error) {
          console.error("Error updating energy:", error)
          // We'll keep the local state as is since we've already updated it
        }
      }
    } finally {
      isUpdatingEnergy.current = false
    }
  }, [userId, energy, maxEnergy])

  // Process coin update queue with debouncing
  const processCoinUpdateQueue = useCallback(async () => {
    if (!userId || isUpdatingCoins.current || coinUpdateQueue.current.length === 0) return

    isUpdatingCoins.current = true
    try {
      // Take the first item from the queue
      const updateItem = coinUpdateQueue.current.shift()
      if (!updateItem) return

      const { amount, transactionType, description } = updateItem

      try {
        // Try to update in database
        const result = await updateUserCoins(userId, amount, transactionType, description)

        // If we got a null result but no error was thrown, it means we hit rate limiting
        if (result === null) {
          console.warn("Coin update may have been rate limited. Using local value.")

          // Schedule a sync attempt for later
          setTimeout(() => {
            supabase
              .from("users")
              .select("coins")
              .eq("id", userId)
              .single()
              .then(({ data }) => {
                if (data) {
                  setCoins(data.coins)
                  console.log("Delayed coin sync successful")
                }
              })
              .catch((err) => console.error("Delayed coin sync failed:", err))
          }, 5000) // Try again in 5 seconds
        }
      } catch (error) {
        console.error("Error updating coins:", error)
        // We'll keep the local state as is since we've already updated it
      }

      // Process the next item in the queue if there are more
      if (coinUpdateQueue.current.length > 0) {
        setTimeout(() => {
          processCoinUpdateQueue()
        }, 500) // Process next item after a delay
      }
    } finally {
      isUpdatingCoins.current = false
    }
  }, [userId])

  // Set up the debounced energy update processor
  useEffect(() => {
    const processQueueInterval = setInterval(() => {
      if (energyUpdateQueue.current !== 0) {
        processEnergyUpdateQueue()
      }

      if (coinUpdateQueue.current.length > 0 && !isUpdatingCoins.current) {
        processCoinUpdateQueue()
      }
    }, 1000) // Process queues every second

    return () => clearInterval(processQueueInterval)
  }, [processEnergyUpdateQueue, processCoinUpdateQueue])

  // Energy regeneration timer
  const updateEnergyHandler = useCallback(
    async (amount: number) => {
      if (!userId) return

      // Add to the queue instead of updating immediately
      energyUpdateQueue.current += amount

      // Calculate new energy locally for immediate feedback
      const newEnergy = Math.max(0, Math.min(maxEnergy, energy + amount))

      // Update local state immediately for responsive UI
      setEnergy(newEnergy)
      setLastEnergyUpdate(new Date())

      // Clear any existing timer
      if (energyUpdateTimer.current) {
        clearTimeout(energyUpdateTimer.current)
      }

      // Set a new timer to process the queue after a delay
      energyUpdateTimer.current = setTimeout(() => {
        processEnergyUpdateQueue()
      }, 500) // 500ms debounce

      return newEnergy
    },
    [userId, energy, maxEnergy, processEnergyUpdateQueue],
  )

  useEffect(() => {
    let energyInterval: NodeJS.Timeout | null = null

    if (userId && energy < maxEnergy) {
      const chargeMultiplier = 1 + (boosts.chargeSpeed.level - 1) * 0.2 // 20% increase per level
      const regenTime = 60000 / chargeMultiplier // Adjust regen time based on charge speed

      energyInterval = setInterval(() => {
        // Add to queue instead of updating immediately
        energyUpdateQueue.current += 1

        // Update local state immediately
        setEnergy((prev) => Math.min(maxEnergy, prev + 1))
        setLastEnergyUpdate(new Date())

        // Process queue less frequently
        if (Math.random() < 0.2) {
          // Only process about 20% of the time
          processEnergyUpdateQueue()
        }
      }, regenTime) // Adjusted time
    }

    return () => {
      if (energyInterval) clearInterval(energyInterval)
    }
  }, [userId, energy, maxEnergy, boosts.chargeSpeed.level, processEnergyUpdateQueue])

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

  // Update coins in state and database with debouncing
  const updateCoinsHandler = async (amount: number, transactionType: string, description?: string) => {
    if (!userId) return false

    // For negative amounts (spending), check if user has enough coins
    if (amount < 0 && coins + amount < 0) {
      console.log("Not enough coins for this transaction")
      return false // Return false to indicate failure
    }

    // Update local state immediately for responsive UI
    const newCoins = coins + amount
    setCoins(newCoins)

    // Add to the queue instead of updating immediately
    coinUpdateQueue.current.push({ amount, transactionType, description })

    // Clear any existing timer
    if (coinUpdateTimer.current) {
      clearTimeout(coinUpdateTimer.current)
    }

    // Set a new timer to process the queue after a delay
    coinUpdateTimer.current = setTimeout(() => {
      processCoinUpdateQueue()
    }, 500) // 500ms debounce

    // Check if user should be promoted to next league
    if (amount > 0) {
      checkAndUpdateLeague(newCoins)
    }

    return true // Return true to indicate success
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

  // Handle tap action with rate limiting
  const handleTap = async () => {
    if (energy <= 0) return // Don't proceed if no energy

    // Implement tap rate limiting
    const now = Date.now()
    if (now - lastTapTime.current < tapCooldown) {
      console.log("Tapping too fast, ignoring tap")
      return
    }
    lastTapTime.current = now

    // Only update combo and show effects if energy is available
    if (energy > 0) {
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

      // Update coins through the queue system
      await updateCoinsHandler(coinsToEarn, "tap", `Earned from tapping (${multiplier}x combo)`)

      // Update energy through the queue system
      await updateEnergyHandler(-1)
    }
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
        updatedBoosts.chargeSpeed.cost = result.cost || Math.floor(boosts.chargeSpeed.cost * 1.5)
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
  const [handleRocketBoost, setHandleRocketBoost] = useState<() => Promise<void>>(() => async () => {})
  useEffect(() => {
    const memoizedHandleRocketBoost = async () => {
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
    }
    setHandleRocketBoost(() => memoizedHandleRocketBoost)
  }, [boosts, energy, maxEnergy, userId, isLoadingRocket])

  const rocketBoost = useCallback(() => {
    return {
      result: resultRocket,
      isLoading: isLoadingRocket,
      handleRocketBoost: handleRocketBoost,
    }
  }, [resultRocket, isLoadingRocket, handleRocketBoost])

  // Use full energy boost
  const [useFullEnergyBoostHandler, setUseFullEnergyBoostHandler] = useState<
    () => Promise<{ success: boolean; message?: string }>
  >(() => async () => ({ success: false }))
  useEffect(() => {
    const memoizedUseFullEnergyBoostHandler = async () => {
      if (!userId) return { success: false, message: "User not found" }

      const result = await useFullEnergyBoost(userId)
      setFullEnergyBoostResult(result)

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
    }
    setUseFullEnergyBoostHandler(() => memoizedUseFullEnergyBoostHandler)
  }, [boosts, energy, maxEnergy, userId])

  // Enhanced refreshUserData function to ensure hourly earnings are updated
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

      // Recalculate hourly earnings from cards to ensure they're up to date
      const { data: userItems } = await supabase.from("user_items").select("hourly_income").eq("user_id", userId)

      if (userItems) {
        const calculatedHourlyEarn = userItems.reduce((total, item) => total + item.hourly_income, 0)

        // Update the state and database if different
        if (calculatedHourlyEarn !== userData.hourly_earn) {
          setHourlyEarn(calculatedHourlyEarn)

          await supabase
            .from("users")
            .update({
              hourly_earn: calculatedHourlyEarn,
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId)
        }
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
