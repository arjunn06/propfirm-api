import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  try {

    // =====================
    // GET QUERY PARAMS
    // =====================

    const { searchParams } =
      new URL(req.url)

    const market =
      searchParams.get("market")

    const size =
      searchParams.get("size")

    const activation =
      searchParams.get("activation")

    console.log("QUERY:", {

      market,
      size,
      activation
    })

    // =====================
    // FETCH DATA
    // =====================

    const { data, error } =

      await supabase

        .from("offers")

        .select("*")

        .eq("active", true)

    if (error) {

      console.error(error)

      return NextResponse.json({

        error:
          error.message
      })
    }

    console.log("RAW DATA:", data)

    // =====================
    // FILTER
    // =====================

    const filtered =

      data.filter((offer) => {

        const dbMarket =

          String(
            offer.market_type
          )

            .trim()

            .toLowerCase()

        const incomingMarket =

          String(market)

            .trim()

            .toLowerCase()

        const dbSize =

          String(
            offer.account_size
          )

            .replace(/k/i, "000")

            .trim()

        const incomingSize =

          String(size)

            .replace(/k/i, "000")

            .trim()

        const dbActivation =

          String(
            offer.activation_fee
          )

            .trim()

            .toLowerCase()

        const incomingActivation =

          String(activation)

            .trim()

            .toLowerCase()

        const marketMatch =

          dbMarket ===
          incomingMarket

        const sizeMatch =

          incomingSize === "any"

          ||

          dbSize ===
          incomingSize

        const activationMatch =

          dbActivation ===
          incomingActivation

        console.log({

          dbMarket,
          incomingMarket,

          dbSize,
          incomingSize,

          dbActivation,
          incomingActivation,

          marketMatch,
          sizeMatch,
          activationMatch
        })

        return (

          marketMatch

          &&

          sizeMatch

          &&

          activationMatch
        )
      })

    console.log("FILTERED:", filtered)

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
    // CALCULATE FINAL PRICE
    // =====================

    const withFinalPrices =

      filtered.map((offer) => {

        const mrp =
          Number(offer.mrp)

        const discount =
          Number(
            offer.discount_percent
          )

        const final_price =

          mrp -

          (
            mrp * discount / 100
          )

        return {

          ...offer,

          final_price
        }
      })

    // =====================
    // SORT BY CHEAPEST
    // =====================

    withFinalPrices.sort(

      (a, b) =>

        a.final_price

        -

        b.final_price
    )

    const best =
      withFinalPrices[0]

    // =====================
    // RESPONSE
    // =====================

    return NextResponse.json({

  firm_name:
    best.firm_name,

  account_name:
    best.account_name,

  account_size:
    best.account_size,

  discount_percent:
    best.discount_percent,

  final_price:
    best.final_price,

  promo_code:
    best.promo_code,

  affiliate_link:
    best.affiliate_link,

  updated_at:
    new Date().toISOString()
})
    
  } catch (err) {

    console.error(err)

    return NextResponse.json({

      error:
        "Internal server error"
    })
  }
}
