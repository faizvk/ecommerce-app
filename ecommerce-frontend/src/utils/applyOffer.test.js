import { describe, it, expect } from "vitest";
import { buildOfferMap, computeOfferPrice, getOfferPricing } from "./applyOffer";

describe("buildOfferMap", () => {
  it("returns empty Map for empty input", () => {
    expect(buildOfferMap([]).size).toBe(0);
  });

  it("indexes products by id with their offer", () => {
    const offer = {
      _id: "o1",
      discountType: "percent",
      discountValue: 20,
      productIds: [{ _id: "p1" }, { _id: "p2" }],
    };
    const map = buildOfferMap([offer]);
    expect(map.get("p1")).toBe(offer);
    expect(map.get("p2")).toBe(offer);
    expect(map.get("p3")).toBeUndefined();
  });

  it("first offer wins when same product is in multiple offers", () => {
    const a = { _id: "a", discountValue: 10, productIds: [{ _id: "x" }] };
    const b = { _id: "b", discountValue: 50, productIds: [{ _id: "x" }] };
    const map = buildOfferMap([a, b]);
    expect(map.get("x")).toBe(a);
  });

  it("handles string ids alongside populated objects", () => {
    const offer = {
      _id: "o",
      discountValue: 10,
      productIds: ["abc", { _id: "def" }],
    };
    const map = buildOfferMap([offer]);
    expect(map.has("abc")).toBe(true);
    expect(map.has("def")).toBe(true);
  });
});

describe("computeOfferPrice", () => {
  it("applies percent discount", () => {
    expect(computeOfferPrice(1000, { discountType: "percent", discountValue: 20 })).toBe(800);
    expect(computeOfferPrice(99, { discountType: "percent", discountValue: 50 })).toBe(50); // rounded
  });

  it("applies fixed discount", () => {
    expect(computeOfferPrice(500, { discountType: "fixed", discountValue: 100 })).toBe(400);
  });

  it("never goes below 0", () => {
    expect(computeOfferPrice(50, { discountType: "fixed", discountValue: 200 })).toBe(0);
    expect(computeOfferPrice(50, { discountType: "percent", discountValue: 150 })).toBe(0);
  });

  it("returns original price when no offer", () => {
    expect(computeOfferPrice(123, null)).toBe(123);
  });
});

describe("getOfferPricing", () => {
  const product = { _id: "p1", salePrice: 1000 };

  it("returns hasOffer:false when product not in any offer", () => {
    const pricing = getOfferPricing(product, new Map());
    expect(pricing).toEqual({
      hasOffer: false,
      offer: null,
      originalPrice: 1000,
      finalPrice: 1000,
      savings: 0,
      percentOff: 0,
    });
  });

  it("computes savings + percent for matching offer", () => {
    const offer = { _id: "o", discountType: "percent", discountValue: 25, productIds: [{ _id: "p1" }] };
    const map = buildOfferMap([offer]);
    const pricing = getOfferPricing(product, map);
    expect(pricing.hasOffer).toBe(true);
    expect(pricing.finalPrice).toBe(750);
    expect(pricing.savings).toBe(250);
    expect(pricing.percentOff).toBe(25);
  });
});
