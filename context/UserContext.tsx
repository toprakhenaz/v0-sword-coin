"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  updateUserCoins,
  updateUserEnergy,
  upgradeBoost as dbUpgradeBoost,
  useRocketBoost as dbUseRocketBoost,
  useFullEnergyBoost as dbUseFullEnergyBoost,
  collectHourlyEarnings as dbCollectHourlyEarnings,
  getUserDailyCombo,
  findDailyComboCard,
  updateUserHourlyEarn,
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
        ready: () => void
        expand: () => void
      }
    }
  }
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
  lastHourlyCollect: Date | null
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
  collectHourlyEarnings: () => Promise<{ success: boolean; coins?: number; message?: string; timeLeft?: number }>
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
  const [lastHourlyCollect, setLastHourlyCollect] = useState<Date | null>(null)
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

  // Debounce and rate limiting
  const energyUpdateQueue = useRef<number>(0)
  const isUpdatingEnergy = useRef<boolean>(false)
  const energyUpdateTimer = useRef<NodeJS.Timeout | null>(null)
  const coinUpdateQueue = useRef<{ amount: number; transactionType: string; description?: string }[]>([])
  const isUpdatingCoins = useRef<boolean>(false)
  const coinUpdateTimer = useRef<NodeJS.Timeout | null>(null)
  const lastTapTime = useRef<number>(0)
  const tapCooldown = 300

  // Helper to calculate league rewards
  const calculateLeagueReward = (league: number): number => {
    const rewards = [0, 50000, 500000, 5000000, 50000000, 500000000, 5000000000]
    return rewards[league - 1] || 0
  }

  // Set league with rewards
  const setLeague = (newLeague: number) => {
    if (newLeague !== league && newLeague > league) {
      setPreviousLeague(league)
      setIsLevelingUp(true)

      const newEarnPerTap = 1 + (boosts.multiTouch.level - 1) * 2
      const newMaxEnergy = 100 + (boosts.energyLimit.level - 1) * 500

      const leagueReward = calculateLeagueReward(newLeague)

      if (userId) {
        supabase
          .from("users")
          .update({
            league: newLeague,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .then(({ error }) => {
            if (error) console.error("Error updating league:", error)
          })
      }

      setTimeout(() => {
        setLeagueState(newLeague)
        
        if (leagueReward > 0) {
          updateCoinsHandler(leagueReward, "league_reward", `Reached ${newLeague} League`)
        }

        setTimeout(() => {
          setIsLevelingUp(false)
        }, 1000)
      }, 500)
    }
  }

  // Initialize user data
  useEffect(() => {
    const initUser = async () => {
      try {
        await fetch("/api/seed")

        let telegramUserId = null
        let telegramUsername = null

        if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp.initDataUnsafe.user) {
          telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id.toString()
          telegramUsername = window.Telegram.WebApp.initDataUnsafe.user.username || 
            `${window.Telegram.WebApp.initDataUnsafe.user.first_name || ""} ${window.Telegram.WebApp.initDataUnsafe.user.last_name || ""}`.trim()
        }

        if (!telegramUserId) {
          telegramUserId = "123456789"
          telegramUsername = "dev_user"
        }

        setTelegramId(telegramUserId)
        setUsername(telegramUsername)

        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", telegramUserId)
          .single()

        if (existingUser) {
          setUserId(existingUser.id)
          setCoins(existingUser.coins)
          setEnergy(existingUser.energy)
          setMaxEnergy(existingUser.max_energy)
          setEarnPerTap(existingUser.earn_per_tap)
          setHourlyEarn(existingUser.hourly_earn)
          setLeagueState(existingUser.league)
          setLastEnergyUpdate(new Date(existingUser.last_energy_regen))
          setLastHourlyCollect(new Date(existingUser.last_hourly_collect))

          // Check for offline earnings
          const now = new Date()
          const lastCollect = new Date(existingUser.last_hourly_collect)
          const hoursPassed = (now.getTime() - lastCollect.getTime()) / (1000 * 60 * 60)
          
          if (hoursPassed >= 1 && existingUser.hourly_earn > 0) {
            const hoursToCount = Math.min(hoursPassed, 24)
            const offlineEarnings = Math.floor(existingUser.hourly_earn * hoursToCount)
            
            // Auto-collect offline earnings
            if (offlineEarnings > 0) {
              await updateUserCoins(existingUser.id, offlineEarnings, "offline_earnings", `Earned while offline (${hoursToCount.toFixed(1)}h)`)
              setCoins(existingUser.coins + offlineEarnings)
              
              await supabase
                .from("users")
                .update({
                  last_hourly_collect: now.toISOString(),
                  coins: existingUser.coins + offlineEarnings,
                })
                .eq("id", existingUser.id)
            }
          }

          // Load boosts
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

            // Update earn per tap and max energy based on boosts
            setEarnPerTap(1 + (userBoosts.multi_touch_level - 1) * 2)
            setMaxEnergy(100 + (userBoosts.energy_limit_level - 1) * 500)
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
                hourly_earn: 0,
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
            setCoins(1000)
            setEnergy(100)
            setMaxEnergy(100)
            setEarnPerTap(1)
            setHourlyEarn(0)
            setLeagueState(1)
            setLastEnergyUpdate(new Date())
            setLastHourlyCollect(new Date())

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

  // Energy regeneration timer
  useEffect(() => {
    let energyInterval: NodeJS.Timeout | null = null

    if (userId && energy < maxEnergy) {
      const baseRegenTime = Math.max(3, 15 - (league - 1) * 2) * 1000
      const chargeMultiplier = 1 + (boosts.chargeSpeed.level - 1) * 0.2
      const regenTime = baseRegenTime / chargeMultiplier

      energyInterval = setInterval(() => {
        setEnergy((prev) => {
          const newEnergy = Math.min(maxEnergy, prev + 1)
          setLastEnergyUpdate(new Date())
          
          // Update in database occasionally
          if (Math.random() < 0.1) {
            supabase
              .from("users")
              .update({
                energy: newEnergy,
                last_energy_regen: new Date().toISOString(),
              })
              .eq("id", userId)
          }
          
          return newEnergy
        })
      }, regenTime)
    }

    return () => {
      if (energyInterval) clearInterval(energyInterval)
    }
  }, [userId, energy, maxEnergy, league, boosts.chargeSpeed.level])

  // Update coins handler
  const updateCoinsHandler = async (amount: number, transactionType: string, description?: string) => {
    if (!userId) return false

    if (amount < 0 && coins + amount < 0) {
      return false
    }

    const newCoins = coins + amount
    setCoins(newCoins)

    // Update in database
    updateUserCoins(userId, amount, transactionType, description)

    // Check league progression
    if (amount > 0) {
      checkAndUpdateLeague(newCoins)
    }

    return true
  }

  // Update energy handler
  const updateEnergyHandler = async (amount: number) => {
    if (!userId) return

    const newEnergy = Math.max(0, Math.min(maxEnergy, energy + amount))
    setEnergy(newEnergy)
    setLastEnergyUpdate(new Date())

    // Update in database
    updateUserEnergy(userId, amount)
  }

  // Check and update league
  const checkAndUpdateLeague = async (coinCount: number) => {
    const leagueThresholds = [
      { level: 1, threshold: 0 },
      { level: 2, threshold: 10000 },
      { level: 3, threshold: 100000 },
      { level: 4, threshold: 1000000 },
      { level: 5, threshold: 10000000 },
      { level: 6, threshold: 100000000 },
      { level: 7, threshold: 1000000000 },
    ]

    let newLeague = 1
    for (let i = leagueThresholds.length - 1; i >= 0; i--) {
      if (coinCount >= leagueThresholds[i].threshold) {
        newLeague = leagueThresholds[i].level
        break
      }
    }

    if (newLeague > league) {
      setLeague(newLeague)
    }
  }

  // Handle tap
  const handleTap = async () => {
    if (energy <= 0) return

    const now = Date.now()
    if (now - lastTapTime.current < tapCooldown) {
      return
    }
    lastTapTime.current = now

    const newCombo = comboCounter + 1
    setComboCounter(newCombo)

    let multiplier = 1
    if (newCombo > 50) multiplier = 3
    else if (newCombo > 25) multiplier = 2
    else if (newCombo > 10) multiplier = 1.5

    setTapMultiplier(multiplier)

    const coinsToEarn = Math.round(earnPerTap * multiplier)

    await updateCoinsHandler(coinsToEarn, "tap", `Earned from tapping (${multiplier}x combo)`)
    await updateEnergyHandler(-1)
  }

  // Collect hourly earnings
  const collectHourlyEarningsHandler = useCallback(async () => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await dbCollectHourlyEarnings(userId)
    
    if (result.success && result.coins) {
      setCoins(coins + result.coins)
      setLastHourlyCollect(new Date())
      return { success: true, coins: result.coins }
    }

    return result
  }, [userId, coins])

  // Upgrade boost handler
  const upgradeBoostHandler = async (boostType: string) => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await dbUpgradeBoost(userId, boostType)

    if (result.success) {
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

      let cost = 0
      if (boostType === "multiTouch") cost = boosts.multiTouch.cost
      else if (boostType === "energyLimit") cost = boosts.energyLimit.cost
      else if (boostType === "chargeSpeed") cost = boosts.chargeSpeed.cost

      setCoins(coins - cost)

      return { success: true }
    }

    return { success: false, message: result.message || "Failed to upgrade boost" }
  }

  // Rocket boost
  const [resultRocket, setResultRocket] = useState<{ success: boolean; message?: string } | null>(null)
  const [isLoadingRocket, setIsLoadingRocket] = useState(false)

  const handleRocketBoost = useCallback(async () => {
    if (!userId || isLoadingRocket) return

    setIsLoadingRocket(true)
    try {
      const result = await dbUseRocketBoost(userId)
      setResultRocket(result)

      if (result.success) {
        setBoosts({
          ...boosts,
          dailyRockets: result.rocketsLeft || boosts.dailyRockets - 1,
        })
        setEnergy(Math.min(maxEnergy, energy + 500))
      }
    } finally {
      setIsLoadingRocket(false)
    }
  }, [userId, boosts, energy, maxEnergy, isLoadingRocket])

  const rocketBoost = useCallback(() => {
    return {
      result: resultRocket,
      isLoading: isLoadingRocket,
      handleRocketBoost,
    }
  }, [resultRocket, isLoadingRocket, handleRocketBoost])

  // Full energy boost
  const useFullEnergyBoostHandler = useCallback(async () => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await dbUseFullEnergyBoost(userId)

    if (result.success) {
      setBoosts({
        ...boosts,
        energyFullUsed: true,
      })
      setEnergy(maxEnergy)
      return { success: true }
    }

    return { success: false, message: result.message || "Failed to use full energy boost" }
  }, [userId, boosts, maxEnergy])

  // Refresh user data
  const refreshUserData = async () => {
    if (!userId) return

    try {
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (userData) {
        setCoins(userData.coins)
        setEnergy(userData.energy)
        setMaxEnergy(userData.max_energy)
        setEarnPerTap(userData.earn_per_tap)
        setHourlyEarn(userData.hourly_earn)
        setLeagueState(userData.league)
        setLastEnergyUpdate(new Date(userData.last_energy_regen))
        setLastHourlyCollect(new Date(userData.last_hourly_collect))
      }

      // Recalculate hourly earnings from user items
      const hourlyEarnValue = await updateUserHourlyEarn(userId)
      if (hourlyEarnValue !== hourlyEarn) {
        setHourlyEarn(hourlyEarnValue)
      }

      // Refresh boosts
      const { data: userBoosts } = await supabase
        .from("user_boosts")
        .select("*")
        .eq("user_id", userId)
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

      // Refresh daily combo
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

  // Find combo card
  const findComboCardHandler = async (cardIndex: number) => {
    if (!userId) return { success: false, message: "User not found" }

    const result = await findDailyComboCard(userId, cardIndex)

    if (result.success) {
      const updatedDailyCombo = { ...dailyCombo }
      updatedDailyCombo.foundCardIds = result.foundCardIds || dailyCombo.foundCardIds
      updatedDailyCombo.isCompleted = result.isCompleted || dailyCombo.isCompleted

      setDailyCombo(updatedDailyCombo)

      if (result.isCompleted && result.reward) {
        setCoins(coins + result.reward)
      }

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
        lastHourlyCollect,
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