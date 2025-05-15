import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { TelegramUser, startParam } = await request.json()
    console.log("Incoming Telegram User:", TelegramUser)

    const userId = TelegramUser ? TelegramUser.id : 1
    const supabase = getSupabaseServerClient()

    // Kullanıcıyı veritabanında ara
    const { data: user, error: fetchError } = await supabase.from("users").select("*").eq("userId", userId).single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Error fetching user:", fetchError)
      return NextResponse.json({ message: "Error fetching user", success: false }, { status: 500 })
    }

    if (user) {
      // Kullanıcı varsa, son giriş zamanını güncelle
      const { error: updateError } = await supabase
        .from("users")
        .update({ lastLogin: new Date().toISOString() })
        .eq("id", user.id)

      if (updateError) {
        console.error("Error updating user:", updateError)
      }

      return NextResponse.json({ user, success: true })
    } else {
      // Kullanıcı yoksa, yeni kullanıcı oluştur
      let coin = 0

      if (startParam) {
        // Referans veren kullanıcıyı kontrol et
        const { data: referrer } = await supabase
          .from("users")
          .select("id")
          .eq("id", Number.parseInt(startParam))
          .single()

        if (referrer) {
          console.log("Referrer found with ID:", referrer.id)

          // Referans kaydı oluştur
          const { error: referralError } = await supabase.from("referrals").insert({
            referrerId: referrer.id,
            referredId: userId,
            referredName: TelegramUser?.username || "Anonymous",
            rewardAmount: 100000,
            isClaimed: false,
            previousLeague: 1,
            createdAt: new Date().toISOString(),
          })

          if (referralError) {
            console.error("Error creating referral:", referralError)
          } else {
            coin = 100000
          }
        }
      }

      // Yeni kullanıcı oluştur
      const newUser = {
        userId: userId,
        username: TelegramUser?.username || "Anonymous",
        firstName: TelegramUser?.first_name || "",
        lastName: TelegramUser?.last_name || "",
        coins: coin,
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
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      const { data: createdUser, error: createError } = await supabase.from("users").insert(newUser).select().single()

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ message: "Error creating user", success: false }, { status: 500 })
      }

      console.log("New user created with ID:", createdUser.id)
      return NextResponse.json({ user: createdUser, success: true })
    }
  } catch (error) {
    console.error("Error during user creation or fetching:", error)
    return NextResponse.json({ message: "Error creating or fetching user", success: false }, { status: 500 })
  }
}

export async function GET() {
  return new NextResponse("Method Not Allowed", { status: 405 })
}
