"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { TelegramUser, User } from "@/types"
import toast from "react-hot-toast"

type UserContextType = {
  user: User | null
  loading: boolean
  initUser: (telegramUser: TelegramUser, startParam: string) => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  initUser: async () => {},
  updateUser: async () => {},
})

export const useUser = () => useContext(UserContext)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const initUser = useCallback(async (telegramUser: TelegramUser, startParam: string) => {
    try {
      setLoading(true)
      const supabase = getSupabaseClient()

      // Kullanıcıyı veritabanında ara
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("telegramId", telegramUser.id)
        .single()

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error
        console.error("Error fetching user:", fetchError)
        toast.error("Error loading user data")
        return
      }

      if (existingUser) {
        // Kullanıcı varsa, son giriş zamanını güncelle
        const { error: updateError } = await supabase
          .from("users")
          .update({ lastLogin: new Date().toISOString() })
          .eq("id", existingUser.id)

        if (updateError) {
          console.error("Error updating user:", updateError)
        }

        setUser(transformDatabaseUser(existingUser))
      } else {
        // Yeni kullanıcı oluştur
        let referrerId = null

        // startParam bir kullanıcı ID'si mi kontrol et
        if (startParam) {
          const { data: referrer } = await supabase
            .from("users")
            .select("id")
            .eq("id", Number.parseInt(startParam))
            .single()

          if (referrer) {
            referrerId = referrer.id
          }
        }

        const newUser = {
          telegramId: telegramUser.id,
          username: telegramUser.username || `user${telegramUser.id}`,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || "",
          coins: referrerId ? 100000 : 0, // Referans varsa bonus coin
          energy: 500,
          energyMax: 500,
          league: 1,
          crystals: 0,
          coinsHourly: 0,
          coinsPerTap: 1,
          lastBoostTime: new Date().toISOString(),
          dailyBoostCount: 3,
          dailyCardRewardClaimed: false,
          foundCards: "",
          dailyRewardDate: new Date().toISOString(),
          dailyRewardStreak: 1,
          dailyRewardClaimed: false,
          referrerId: referrerId,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }

        const { data: createdUser, error: createError } = await supabase.from("users").insert(newUser).select().single()

        if (createError) {
          console.error("Error creating user:", createError)
          toast.error("Error creating user account")
          return
        }

        // Referans veren varsa, referans kaydı oluştur
        if (referrerId) {
          const { error: referralError } = await supabase.from("referrals").insert({
            referrerId: referrerId,
            referredId: createdUser.id,
            referredName: telegramUser.username || `user${telegramUser.id}`,
            rewardAmount: 100000,
            isClaimed: false,
            previousLeague: 1,
            createdAt: new Date().toISOString(),
          })

          if (referralError) {
            console.error("Error creating referral:", referralError)
          }
        }

        setUser(transformDatabaseUser(createdUser))
        toast.success("Sword Coin'e hoş geldiniz!")
      }
    } catch (error) {
      console.error("Error initializing user:", error)
      toast.error("Error connecting to the server")
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(
    async (userData: Partial<User>) => {
      if (!user) {
        console.error("User not loaded")
        return
      }

      try {
        const supabase = getSupabaseClient()

        // Kullanıcı verilerini veritabanı formatına dönüştür
        const dbData = Object.entries(userData).reduce(
          (acc, [key, value]) => {
            // camelCase'i snake_case'e dönüştür
            const dbKey = key.replace(/([A-Z])/g, "_$1").toLowerCase()
            acc[dbKey] = value
            return acc
          },
          {} as Record<string, any>,
        )

        const { error } = await supabase.from("users").update(dbData).eq("id", user.id)

        if (error) {
          console.error("Error updating user:", error)
          toast.error("Failed to update user data")
          return
        }

        // Yerel durumu güncelle
        setUser((prev) => (prev ? { ...prev, ...userData } : null))
      } catch (error) {
        console.error("Error updating user:", error)
        toast.error("Error saving data")
      }
    },
    [user],
  )

  // Veritabanı kullanıcısını frontend kullanıcısına dönüştüren yardımcı fonksiyon
  function transformDatabaseUser(dbUser: any): User {
    return {
      id: dbUser.id,
      telegramId: dbUser.telegram_id,
      username: dbUser.username,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      coins: dbUser.coins,
      energy: dbUser.energy,
      energyMax: dbUser.energy_max,
      league: dbUser.league,
      crystals: dbUser.crystals,
      coinsHourly: dbUser.coins_hourly,
      coinsPerTap: dbUser.coins_per_tap,
      lastBoostTime: dbUser.last_boost_time,
      dailyBoostCount: dbUser.daily_boost_count,
      dailyCardRewardClaimed: dbUser.daily_card_reward_claimed,
      foundCards: dbUser.found_cards,
      dailyRewardDate: dbUser.daily_reward_date,
      dailyRewardStreak: dbUser.daily_reward_streak,
      dailyRewardClaimed: dbUser.daily_reward_claimed,
      referrerId: dbUser.referrer_id,
      createdAt: dbUser.created_at,
      lastLogin: dbUser.last_login,
    }
  }

  return <UserContext.Provider value={{ user, loading, initUser, updateUser }}>{children}</UserContext.Provider>
}
