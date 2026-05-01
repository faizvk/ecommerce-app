// Build a productId → offer map from active offers list
export function buildOfferMap(offers = []) {
  const map = new Map();
  for (const offer of offers) {
    if (!offer || !Array.isArray(offer.productIds)) continue;
    for (const p of offer.productIds) {
      const id = typeof p === "string" ? p : p?._id;
      if (!id) continue;
      // If a product is in multiple offers, the first (newest) wins
      if (!map.has(id)) map.set(id, offer);
    }
  }
  return map;
}

// Compute the offer price for a product based on a given offer
export function computeOfferPrice(salePrice, offer) {
  if (!offer || salePrice == null) return salePrice;
  const value = Number(offer.discountValue) || 0;
  if (offer.discountType === "fixed") {
    return Math.max(0, Math.round(salePrice - value));
  }
  // percent
  return Math.max(0, Math.round(salePrice * (1 - value / 100)));
}

// Returns { hasOffer, offer, originalPrice, finalPrice, savings, percentOff }
export function getOfferPricing(product, offerMap) {
  const original = product?.salePrice ?? 0;
  const offer = offerMap?.get(product?._id);

  if (!offer) {
    return { hasOffer: false, offer: null, originalPrice: original, finalPrice: original, savings: 0, percentOff: 0 };
  }

  const final = computeOfferPrice(original, offer);
  const savings = Math.max(0, original - final);
  const percentOff = original > 0 ? Math.round((savings / original) * 100) : 0;

  return { hasOffer: true, offer, originalPrice: original, finalPrice: final, savings, percentOff };
}
