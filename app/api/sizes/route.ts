import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  const { searchParams } =
    new URL(req.url)

  const market =
    searchParams.get("market")

  const { data, error } =
    await supabase
      .from("offers")
      .select("account_size")
      .eq("market_type", market)
      .eq("active", true)

  if (error) {

    return NextResponse.json({
      error: error.message
    })
  }

  const sizes =
    [...new Set(
      data.map(
        item => item.account_size
      )
    )]

  sizes.sort((a, b) => a - b)

  return NextResponse.json({
    sizes
  })
}
