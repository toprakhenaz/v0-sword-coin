import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const { userId } = await request.json()
  const supabase = getSupabaseServerClient()

  try {
    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("userId", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Kullanıcının kartlarını al
    const { data: cards, error: cardsError } = await supabase.from("user_cards").select("*").eq("userId", user.id)

    if (cardsError) {
      console.error("Error fetching cards:", cardsError)
      return NextResponse.json({ error: "Error fetching cards" }, { status: 500 })
    }

    // Kullanıcı ve kart verilerini birleştir
    const userData = {
      ...user,
      cards: cards || [],
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
