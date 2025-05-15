import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()
    const supabase = getSupabaseServerClient()

    // Admin kullanıcısını kontrol et
    const { data: admin, error } = await supabase.from("admin_users").select("*").eq("username", username).single()

    if (error || !admin) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Şifreyi kontrol et (gerçek uygulamada hash'lenmiş şifre kullanılmalıdır)
    if (admin.password !== password) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Başarılı giriş
    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
