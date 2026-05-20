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

  const uniqueMarkets =
    [...new Set(
      data.map(
        item => item.market_type
      )
    )]

  return NextResponse.json({

    market1:
      uniqueMarkets[0] || "",

    market2:
      uniqueMarkets[1] || "",

    market3:
      uniqueMarkets[2] || ""
  })
}
