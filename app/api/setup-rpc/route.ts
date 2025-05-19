import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("RPC fonksiyonları oluşturuluyor")
    const supabase = createServerClient()

    // exec_sql fonksiyonu
    try {
      await supabase.rpc("exec_sql", {
        sql_query: `SELECT 1`,
      })
      console.log("exec_sql fonksiyonu zaten var")
    } catch (error) {
      console.log("exec_sql fonksiyonu oluşturuluyor...")

      // SQL fonksiyonu oluştur
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
          RETURNS TEXT
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
            RETURN 'SQL executed successfully';
          END;
          $$;
        `,
      })

      if (createError) {
        console.error("exec_sql fonksiyonu oluşturma hatası:", createError)
      } else {
        console.log("exec_sql fonksiyonu oluşturuldu")
      }
    }

    // get_table_columns fonksiyonu
    try {
      await supabase.rpc("get_table_columns", {
        table_name: "users",
      })
      console.log("get_table_columns fonksiyonu zaten var")
    } catch (error) {
      console.log("get_table_columns fonksiyonu oluşturuluyor...")

      // SQL fonksiyonu oluştur
      const { error: createError } = await supabase.rpc("exec_sql", {
        sql_query: `
          CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
          RETURNS TEXT[]
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            columns TEXT[];
          BEGIN
            SELECT array_agg(column_name::TEXT) INTO columns
            FROM information_schema.columns
            WHERE table_name = $1;
            RETURN columns;
          END;
          $$;
        `,
      })

      if (createError) {
        console.error("get_table_columns fonksiyonu oluşturma hatası:", createError)
      } else {
        console.log("get_table_columns fonksiyonu oluşturuldu")
      }
    }

    return NextResponse.json({ success: true, message: "RPC fonksiyonları oluşturuldu" })
  } catch (error) {
    console.error("RPC fonksiyonları oluşturma hatası:", error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
