import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { userId, coins, dailyRewardStreak, dailyRewardDate, dailyRewardClaimed } = await req.json()
    const supabase = getSupabaseServerClient()

    // userId kontrolü yap
    if (!userId) {
      console.log(userId)
      return NextResponse.json({ error: "User ID eksik!" }, { status: 400 })
    }

    // Veritabanında günlük ödül güncellemesi
    const { error } = await supabase
      .from("users")
      .update({
        coins,
        dailyRewardStreak,
        dailyRewardDate: dailyRewardDate,
        dailyRewardClaimed,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Kullanıcı güncellenirken hata oluştu." }, { status: 500 })
    }

    return NextResponse.json({ message: "Günlük ödül başarıyla alındı." })
  } catch (error) {
    console.error("Günlük ödül kaydedilirken hata oluştu:", error)
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 })
  }
}
