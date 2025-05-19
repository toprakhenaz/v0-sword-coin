import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Check if tables exist
    const { data: tablesExist, error: checkError } = await supabase.rpc("check_tables_exist")

    if (checkError) {
      console.error("Error checking tables:", checkError)
      return NextResponse.json({ error: "Failed to check tables" }, { status: 500 })
    }

    // If tables already exist, return success
    if (tablesExist) {
      return NextResponse.json({ success: true, message: "Database already seeded" })
    }

    // Create tables
    const { error: createError } = await supabase.rpc("create_tables")

    if (createError) {
      console.error("Error creating tables:", createError)
      return NextResponse.json({ error: "Failed to create tables" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
