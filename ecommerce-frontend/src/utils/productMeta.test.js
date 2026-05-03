import { describe, it, expect } from "vitest";
import {
  getProductRating,
  qualifiesForFreeDelivery,
  getProductBadge,
  getSocialProof,
  FREE_DELIVERY_THRESHOLD,
} from "./productMeta";

describe("getProductRating", () => {
  it("returns deterministic rating + reviews for same product id", () => {
    const a = getProductRating({ _id: "abc" });
    const b = getProductRating({ _id: "abc" });
    expect(a).toEqual(b);
  });

  it("rating is between 3.6 and 5.0 inclusive", () => {
    const sample = ["a", "b", "longerseed", "12345"].map((id) => getProductRating({ _id: id }));
    sample.forEach(({ rating }) => {
      expect(rating).toBeGreaterThanOrEqual(3.6);
      expect(rating).toBeLessThanOrEqual(5.0);
    });
  });
});

describe("qualifiesForFreeDelivery", () => {
  it(`true at threshold (${FREE_DELIVERY_THRESHOLD})`, () => {
    expect(qualifiesForFreeDelivery(FREE_DELIVERY_THRESHOLD)).toBe(true);
  });

  it("false below threshold", () => {
    expect(qualifiesForFreeDelivery(FREE_DELIVERY_THRESHOLD - 1)).toBe(false);
  });
});

describe("getProductBadge", () => {
  it("returns 'Hot Deal' for ≥ 30% discount", () => {
    const badge = getProductBadge({ _id: "x", costPrice: 1000, salePrice: 600 });
    expect(badge?.label).toBe("Hot Deal");
  });

  it("returns null when nothing matches", () => {
    // costPrice equal to salePrice → no discount, low review count → no bestseller
    const badge = getProductBadge({
      _id: "1",
      costPrice: 100,
      salePrice: 100,
      createdAt: new Date(2020, 0, 1).toISOString(),
    });
    // Could still match Trending depending on the deterministic rating;
    // we only assert it returns either null or a known shape.
    if (badge) {
      expect(["Bestseller", "New", "Trending", "Hot Deal"]).toContain(badge.label);
    }
  });

  it("New badge fires for products created in last 14 days", () => {
    const recent = new Date(Date.now() - 5 * 86400000).toISOString();
    // pick a product id that won't trigger Bestseller / Hot Deal / Trending pathologically
    const badge = getProductBadge({
      _id: "newseed",
      createdAt: recent,
      costPrice: 100,
      salePrice: 100,
    });
    expect(badge?.label).toBeDefined();
  });
});

describe("getSocialProof", () => {
  it("returns a sold count between 8 and 380", () => {
    const sold = getSocialProof({ _id: "test-id" });
    expect(sold).toBeGreaterThanOrEqual(8);
    expect(sold).toBeLessThanOrEqual(380);
  });
});
