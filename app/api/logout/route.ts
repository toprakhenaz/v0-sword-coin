import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = cookies()
  cookieStore.delete("user_id")
  cookieStore.delete("telegram_id")

  return NextResponse.json({ success: true })
}
