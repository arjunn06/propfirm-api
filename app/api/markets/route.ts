import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {

  const { data, error } =
    await supabase
      .from("offers")
      .select("market_type")
      .eq("active", true)

  if (error) {

    return NextResponse.json({
      error: error.message
    })
  }

  const markets =
    [...new Set(
      data.map(
        item => item.market_type
      )
    )]

  return NextResponse.json({
    markets
  })
}
