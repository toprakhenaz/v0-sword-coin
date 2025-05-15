import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export const revalidate = 0 // Disable ISR, fetch new data on every request

export async function GET() {
  try {
    const supabase = getSupabaseServerClient()

    // En son günlük komboyu al
    const { data: latestCombo, error } = await supabase
      .from("daily_combos")
      .select("*")
      .order("createdAt", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching daily combo:", error)
      return NextResponse.json({ error: "No daily combo found" }, { status: 404 })
    }

    return NextResponse.json({ cards: latestCombo.cards })
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching daily combo:", error.message)
      return NextResponse.json({ error: "Failed to fetch daily combo" }, { status: 500 })
    } else {
      console.error("Unknown error occurred while fetching daily combo:", error)
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 })
    }
  }
}
