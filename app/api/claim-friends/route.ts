import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { userId, id, isClaimed, coins } = await req.json()
    const supabase = getSupabaseServerClient()

    // Referansı güncelle
    const { data: updatedFriend, error: referralError } = await supabase
      .from("referrals")
      .update({ isClaimed: isClaimed })
      .eq("id", id)
      .select()
      .single()

    if (referralError) {
      console.error("Error updating referral:", referralError)
      return NextResponse.json({ error: "Referans güncellenirken hata oluştu." }, { status: 500 })
    }

    // Kullanıcının coin miktarını güncelle
    const { error: userError } = await supabase.from("users").update({ coins: coins }).eq("userId", userId)

    if (userError) {
      console.error("Error updating user:", userError)
      return NextResponse.json({ error: "Kullanıcı güncellenirken hata oluştu." }, { status: 500 })
    }

    return NextResponse.json({ message: "Referans başarıyla güncellendi.", updatedFriend })
  } catch (error) {
    console.error("Referans güncellenirken hata oluştu:", error)
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 })
  }
}
