import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { userId, id, isClaimed, coins } = body

    if (!userId || !id || isClaimed === undefined || coins === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update referral status
    const { error: referralError } = await supabase
      .from("referrals")
      .update({ is_claimed: isClaimed })
      .eq("id", id)
      .eq("referrer_id", userId)

    if (referralError) {
      console.error("Error updating referral:", referralError)
      return NextResponse.json({ error: "Failed to update referral" }, { status: 500 })
    }

    // Update user coins
    const { error: userError } = await supabase.from("users").update({ coins }).eq("id", userId)

    if (userError) {
      console.error("Error updating user coins:", userError)
      return NextResponse.json({ error: "Failed to update user coins" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Claim friends error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
