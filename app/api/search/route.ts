const filtered = data.filter((offer) => {

  // Market match
  const marketMatch =

    offer.market_type
      ?.toLowerCase()
      ===
    market?.toLowerCase()

  // Size match
  const sizeMatch =

    size === "any"

    ||

    String(
      offer.account_size
    ) === String(size)

  // Activation match
  const activationMatch =

    String(
      offer.activation_fee
    ) === String(
      activation === "true"
    )

  return (
    marketMatch &&
    sizeMatch &&
    activationMatch
  )
})
