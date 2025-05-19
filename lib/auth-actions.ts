"use server"

import { createHash, createHmac } from "crypto"
import { supabase } from "./supabase"

interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export async function validateAndProcessTelegramAuth(telegramUser: TelegramUser) {
  try {
    // Get the Telegram Bot Token from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!botToken) {
      console.error("Telegram bot token is not defined")
      return { success: false, error: "Bot token not configured" }
    }

    // Create a secret key from the bot token
    const secretKey = createHash("sha256").update(botToken).digest()

    // Extract the hash from the data
    const { hash, ...userData } = telegramUser

    // Sort the object by keys
    const dataCheckString = Object.keys(userData)
      .sort()
      .map((key) => `${key}=${userData[key as keyof typeof userData]}`)
      .join("\n")

    // Create a hash of the data
    const calculatedHash = createHmac("sha256", secretKey).update(dataCheckString).digest("hex")

    // Check if the hash matches
    if (calculatedHash !== hash) {
      return { success: false, error: "Invalid authentication data" }
    }

    // Check if user exists in the database
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramUser.id.toString())
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching user:", fetchError)
      return { success: false, error: "Database error" }
    }

    if (!existingUser) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert([
          {
            telegram_id: telegramUser.id.toString(),
            username: telegramUser.username || `user_${telegramUser.id}`,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name || "",
            photo_url: telegramUser.photo_url || "",
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

      // Create initial boosts for the user
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

      return { success: true, user: newUser }
    } else {
      // User exists
      return { success: true, user: existingUser }
    }
  } catch (error) {
    console.error("Error processing Telegram login:", error)
    return { success: false, error: "Authentication processing failed" }
  }
}
