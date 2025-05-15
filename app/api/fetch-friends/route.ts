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

    // Kullanıcının referanslarını al
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select("*")
      .eq("referrerId", user.id)

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError)
      return NextResponse.json({ error: "Error fetching referrals" }, { status: 500 })
    }

    // Kullanıcı ve referans verilerini birleştir
    const userData = {
      ...user,
      referrals: referrals || [],
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
