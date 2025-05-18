import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Verify Telegram data
    // In a real app, you would verify the data using the Telegram Bot API
    const { telegramId, username, startParam } = body

    if (!telegramId || !username) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single()

    if (userError && userError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error checking user:", userError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingUser) {
      // User exists, return user data
      return NextResponse.json({ user: existingUser })
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        telegram_id: telegramId,
        username,
        coins: 0,
        crystals: 10, // Start with 10 crystals
        earn_per_tap: 1,
        energy: 100,
        max_energy: 100,
        league: 1,
        referral_code: generateReferralCode(),
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating user:", createError)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // If user was referred, create referral record
    if (startParam) {
      try {
        const { error: referralError } = await supabase.from("referrals").insert({
          referrer_id: startParam,
          referred_id: newUser.id,
          reward_amount: 100000,
          is_claimed: false,
        })

        if (referralError) {
          console.error("Error creating referral:", referralError)
        }
      } catch (error) {
        console.error("Error processing referral:", error)
      }
    }

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error("Telegram auth error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateReferralCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
