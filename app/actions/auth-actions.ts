"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"
import { verifyTelegramAuth, parseTelegramAuthData } from "@/lib/telegram-auth"

export async function telegramAuth(initData: string) {
  try {
    // Parse and verify Telegram data
    const authData = parseTelegramAuthData(initData)
    if (!authData || !verifyTelegramAuth(authData)) {
      return { success: false, error: "Invalid authentication data" }
    }

    const telegramId = authData.id
    const username = authData.username || `user_${telegramId}`
    const firstName = authData.first_name
    const lastName = authData.last_name
    const photoUrl = authData.photo_url

    // Create Supabase server client
    const supabase = createServerClient()

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single()

    let userId

    if (userError) {
      // User doesn't exist, create a new one
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            telegram_id: telegramId,
            username: username,
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

      if (createError) {
        console.error("Error creating user:", createError)
        return { success: false, error: "Failed to create user" }
      }

      userId = newUser.id

      // Create initial boosts for the user
      await supabase.from("user_boosts").insert([
        {
          user_id: userId,
          multi_touch_level: 1,
          energy_limit_level: 1,
          charge_speed_level: 1,
          daily_rockets: 3,
          max_daily_rockets: 3,
          energy_full_used: false,
        },
      ])
    } else {
      // User exists
      userId = existingUser.id
    }

    // Set a session cookie
    const cookieStore = cookies()
    cookieStore.set("user_id", userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })
    cookieStore.set("telegram_id", telegramId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    })

    return { success: true, userId }
  } catch (error) {
    console.error("Error in telegramAuth:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function checkAuth() {
  const cookieStore = cookies()
  const userId = cookieStore.get("user_id")?.value
  const telegramId = cookieStore.get("telegram_id")?.value

  if (!userId || !telegramId) {
    return { authenticated: false }
  }

  return { authenticated: true, userId, telegramId }
}

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("user_id")
  cookieStore.delete("telegram_id")
  return { success: true }
}
