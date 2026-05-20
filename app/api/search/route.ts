import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

  try {

    const market =
      req.nextUrl.searchParams.get("market")

    const size =
      req.nextUrl.searchParams.get("size")

    const activation =
      req.nextUrl.searchParams.get("activation")

    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("active", true)

    if (error) {

      return NextResponse.json({
        error: error.message
      })
    }

    if (!data || data.length === 0) {

      return NextResponse.json({
        error: "No offers found"
      })
    }

    let filtered = data

    // Filter market
    if (market) {

      filtered = filtered.filter(
        (offer) =>
          offer.market_type === market
      )
    }

    // Filter size
    if (size && size !== "any") {

      filtered = filtered.filter(
        (offer) =>
          Number(offer.account_size) ===
          Number(size)
      )
    }

    // Filter activation fee
    if (activation) {

      const activationBool =
        activation === "true"

      filtered = filtered.filter(
        (offer) =>
          offer.activation_fee ===
          activationBool
      )
    }

    if (filtered.length === 0) {

      return NextResponse.json({
        error: "No matching firms found"
      })
    }

    // Calculate final prices
    const ranked = filtered.map((offer) => {

      const mrp = Number(offer.mrp)

      const discount =
        Number(offer.discount_percent)

      const finalPrice =
        mrp - (mrp * discount / 100)

      return {
        ...offer,
        final_price: finalPrice
      }
    })

    // Cheapest first
    ranked.sort(
      (a, b) =>
        a.final_price - b.final_price
    )

    return NextResponse.json({
      best: ranked[0],
      alternatives: ranked.slice(1, 4),
      updated_at: new Date()
    })

  } catch (err) {

    return NextResponse.json({
      error: String(err)
    })
  }
}