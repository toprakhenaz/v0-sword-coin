import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { userId, cardId, newLevel, newUserCoins, newUsercrystals, newFoundCards, newDailyCardsFound } =
      await request.json()
    const supabase = getSupabaseServerClient()

    // userId kontrolü
    if (!userId) {
      return NextResponse.json({ error: "User ID eksik!" }, { status: 400 })
    }

    // Kullanıcının kart verilerini al
    const { data: existingUserCard, error: cardError } = await supabase
      .from("user_cards")
      .select("*")
      .eq("userId", userId)
      .eq("cardId", cardId)
      .single()

    if (cardError && cardError.code !== "PGRST116") {
      console.error("Error fetching user card:", cardError)
      return NextResponse.json({ error: "Kart verisi alınamadı!" }, { status: 500 })
    }

    // Kart seviyesini güncelle ya da yeni bir kart oluştur
    if (existingUserCard) {
      // Mevcut kartı güncelle
      const { error: updateError } = await supabase
        .from("user_cards")
        .update({ level: newLevel })
        .eq("id", existingUserCard.id)

      if (updateError) {
        console.error("Error updating card:", updateError)
        return NextResponse.json({ error: "Kart güncellenemedi!" }, { status: 500 })
      }
    } else {
      // Yeni kart oluştur
      const { error: createError } = await supabase.from("user_cards").insert({
        userId: userId,
        cardId: cardId,
        level: newLevel,
      })

      if (createError) {
        console.error("Error creating card:", createError)
        return NextResponse.json({ error: "Kart oluşturulamadı!" }, { status: 500 })
      }
    }

    // Kullanıcının coins, saatlik kazançlarını ve bulunan kartlarını güncelle
    const { error: userError } = await supabase
      .from("users")
      .update({
        coins: newUserCoins,
        crystals: newUsercrystals,
        foundCards: newFoundCards,
        dailyCardRewardClaimed: newDailyCardsFound,
      })
      .eq("id", userId)

    if (userError) {
      console.error("Error updating user:", userError)
      return NextResponse.json({ error: "Kullanıcı güncellenemedi!" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Kart başarıyla güncellendi!",
    })
  } catch (error) {
    console.error("Kart güncelleme hatası:", error)
    return NextResponse.json({ error: "Bir şeyler yanlış gitti!" }, { status: 500 })
  }
}
