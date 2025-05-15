import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"
import { Cards } from "@/data/cardData"

export const revalidate = 0 // Disable ISR, fetch new data on every request

function selectRandomCards(count: number): number[] {
  const shuffled = [...Cards].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count).map((card) => card.id)
}

export async function POST() {
  try {
    const supabase = getSupabaseServerClient()

    // 3 rastgele kart seç
    const dailyCombo = selectRandomCards(3)

    // Tüm kullanıcıları güncelle
    const { error: updateError } = await supabase.from("users").update({
      foundCards: "",
      dailyCardRewardClaimed: false,
      dailyBoostCount: 3,
      lastBoostTime: new Date().toISOString(),
    })

    if (updateError) {
      console.error("Error updating users:", updateError)
      return NextResponse.json({ error: "Failed to update users" }, { status: 500 })
    }

    // Yeni günlük komboyu kaydet
    const { error: comboError } = await supabase.from("daily_combos").insert({
      cards: dailyCombo.join(","),
      createdAt: new Date().toISOString(),
    })

    if (comboError) {
      console.error("Error creating daily combo:", comboError)
      return NextResponse.json({ error: "Failed to create daily combo" }, { status: 500 })
    }

    return NextResponse.json({ message: "Daily reset completed successfully" })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to perform daily reset:", error.message)
      return NextResponse.json({ error: "Failed to perform daily reset" }, { status: 500 })
    } else {
      console.error("Unknown error occurred during daily reset:", error)
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 })
    }
  }
}
