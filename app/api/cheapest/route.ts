import { supabase } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {

  try {

    // Get size from query params
    const size =
      req.nextUrl.searchParams.get("size")

    // Fetch all active offers
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .eq("active", true)

    // Handle DB errors
    if (error) {

      return NextResponse.json({
        error: error.message
      })
    }

    // No data found
    if (!data || data.length === 0) {

      return NextResponse.json({
        error: "No offers found"
      })
    }

    // Filter by account size
    let filtered = data

    if (size) {

      filtered = data.filter(
        (offer) =>
          Number(offer.account_size) ===
          Number(size)
      )
    }

    // No matching size
    if (filtered.length === 0) {

      return NextResponse.json({
        error: "No matching account size found"
      })
    }

    // Calculate final prices
    const offersWithFinalPrice = filtered.map(
      (offer) => {

        const mrp = Number(offer.mrp)

        const discount = Number(
          offer.discount_percent
        )

        const finalPrice =
          mrp - (mrp * discount / 100)

        return {
          ...offer,
          mrp,
          discount_percent: discount,
          final_price: finalPrice
        }
      }
    )

    // Sort cheapest first
    const sorted = offersWithFinalPrice.sort(
      (a, b) => a.final_price - b.final_price
    )

    // Return cheapest deal
    return NextResponse.json(sorted[0])

  } catch (err) {

    console.log(err)

    return NextResponse.json({
      error: String(err)
    })
  }
}