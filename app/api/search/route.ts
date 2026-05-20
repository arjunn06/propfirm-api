import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  const { searchParams } =
    new URL(req.url)

  const market =
    searchParams.get("market")

  const size =
    searchParams.get("size")

  const activation =
    searchParams.get("activation")

  const { data, error } =
    await supabase
      .from("offers")
      .select("*")
      .eq("active", true)

  if (error) {

    return NextResponse.json({

      error: error.message
    })
  }

  const filtered = data.filter((offer) => {

    // =====================
    // MARKET MATCH
    // =====================

    const marketMatch =

      offer.market_type
        ?.toLowerCase()

      ===

      market?.toLowerCase()

    // =====================
    // SIZE MATCH
    // =====================

    const sizeMatch =

      size === "any"

      ||

      String(
        offer.account_size
      )

      ===

      String(size)

    // =====================
    // ACTIVATION MATCH
    // =====================

    const activationMatch =

      String(
        offer.activation_fee
      )

      ===

      String(
        activation === "true"
      )

    return (

      marketMatch

      &&

      sizeMatch

      &&

      activationMatch
    )
  })

  console.log(filtered)

  // =====================
  // NO RESULTS
  // =====================

  if (filtered.length === 0) {

    return NextResponse.json({

      error:
        "No matching firms found"
    })
  }

  // =====================
  // FINAL PRICE
  // =====================

  const withFinalPrices =

    filtered.map(offer => {

      const final_price =

        Number(offer.mrp)

        -

        (
          Number(offer.mrp)

          *

          Number(
            offer.discount_percent
          )

          / 100
        )

      return {

        ...offer,

        final_price
      }
    })

  // =====================
  // SORT CHEAPEST
  // =====================

  withFinalPrices.sort(

    (a, b) =>

      a.final_price

      -

      b.final_price
  )

  const best =
    withFinalPrices[0]

  return NextResponse.json({

    best,

    alternatives:
      withFinalPrices.slice(1, 4),

    updated_at:
      new Date().toISOString()
  })
}
