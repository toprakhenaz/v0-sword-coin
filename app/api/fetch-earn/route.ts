import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const { userId } = await request.json()
  const supabase = getSupabaseServerClient()

  try {
    // Kullanıcı bilgilerini al
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("id", userId).single()

    if (userError) {
      console.error("Error fetching user:", userError)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Kullanıcının görevlerini al
    const { data: missions, error: missionsError } = await supabase.from("missions").select("*").eq("userId", user.id)

    if (missionsError) {
      console.error("Error fetching missions:", missionsError)
      return NextResponse.json({ error: "Error fetching missions" }, { status: 500 })
    }

    // Kullanıcı ve görev verilerini birleştir
    const userData = {
      ...user,
      missions: missions || [],
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
