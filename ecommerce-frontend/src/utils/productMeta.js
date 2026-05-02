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

// Derive a single most-relevant promotional badge for a product card.
// Priority: Hot Deal > Bestseller > New > null
export function getProductBadge(product) {
  if (!product) return null;
  const { rating, reviews } = getProductRating(product);

  // Hot Deal — discount ≥ 30%
  const baseDiscount =
    product.costPrice && product.costPrice > 0 && product.costPrice > product.salePrice
      ? Math.round(((product.costPrice - product.salePrice) / product.costPrice) * 100)
      : 0;
  if (baseDiscount >= 30) {
    return { label: "Hot Deal", cls: "bg-red-500 text-white", emoji: "🔥" };
  }

  // Bestseller — highly rated with many reviews
  if (rating >= 4.6 && reviews >= 200) {
    return { label: "Bestseller", cls: "bg-amber-400 text-amber-900", emoji: "⭐" };
  }

  // New — listed within last 14 days
  if (product.createdAt) {
    const days = (Date.now() - new Date(product.createdAt).getTime()) / 86400000;
    if (days <= 14) {
      return { label: "New", cls: "bg-emerald-500 text-white", emoji: "✨" };
    }
  }

  // Trending — moderately rated with high review count
  if (rating >= 4.3 && reviews >= 150) {
    return { label: "Trending", cls: "bg-blue-500 text-white", emoji: "📈" };
  }

  return null;
}

// Approximate "social proof" purchase count — deterministic per product
export function getSocialProof(product) {
  const { reviews } = getProductRating(product);
  // Convert reviews to a "sold this week" estimate (3x reviews capped)
  const sold = Math.max(8, Math.min(380, Math.round(reviews * 0.6)));
  return sold;
}
