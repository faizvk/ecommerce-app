// Deterministic mock rating/reviews based on product ID — stable across renders.
// (Replace with real review system when backend supports it.)

function hashCode(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getProductRating(product) {
  const seed = hashCode(product?._id || product?.name || "");
  // Rating between 3.6 and 5.0 (most products look good)
  const rating = 3.6 + ((seed % 15) / 10);
  // Reviews between 8 and 480
  const reviews = 8 + (seed % 473);
  return {
    rating: Math.round(rating * 10) / 10,
    reviews,
  };
}

export const FREE_DELIVERY_THRESHOLD = 499;

export function qualifiesForFreeDelivery(price) {
  return Number(price) >= FREE_DELIVERY_THRESHOLD;
}
