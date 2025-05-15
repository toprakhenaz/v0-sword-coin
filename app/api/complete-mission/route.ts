import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { userId, missionDate, missionStatus, missionRef, missionId } = await req.json()
    const supabase = getSupabaseServerClient()

    // Veritabanında yeni bir misyon oluştur
    const { data: newMission, error } = await supabase
      .from("missions")
      .insert({
        userId,
        missionDate: missionDate,
        missionStatus: missionStatus,
        missionRefUname: missionRef,
        missionId: missionId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating mission:", error)
      return NextResponse.json({ error: "Görev oluşturulurken hata oluştu." }, { status: 500 })
    }

    return NextResponse.json({ message: "Görev başarıyla oluşturuldu.", newMission })
  } catch (error) {
    console.error("Görev oluşturulurken hata oluştu:", error)
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 })
  }
}
