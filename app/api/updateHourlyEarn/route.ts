import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export const revalidate = 0 // ISR devre dışı, her istekte yeni veri çeker

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = getSupabaseServerClient()

    // Sadece coins alanını güncelleme
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ coins: body.coins })
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json(updatedUser)
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Başaramadık abi", error.message)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    } else {
      console.log("Başaramadık abi, bilinmeyen hata:", error)
      return NextResponse.json({ error: "Unknown error occurred" }, { status: 500 })
    }
  }
}
