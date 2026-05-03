import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWishlist } from "./useWishlist";

const sampleProduct = {
  _id: "p1",
  name: "Test Product",
  salePrice: 999,
  costPrice: 1500,
  category: "electronics",
  image: ["https://example.com/img.jpg"],
  stock: 10,
};

describe("useWishlist", () => {
  it("starts empty", () => {
    const { result } = renderHook(() => useWishlist());
    expect(result.current.count).toBe(0);
    expect(result.current.items).toEqual([]);
  });

  it("toggle adds a product when not present", () => {
    const { result } = renderHook(() => useWishlist());
    act(() => result.current.toggle(sampleProduct));
    expect(result.current.count).toBe(1);
    expect(result.current.isWishlisted("p1")).toBe(true);
  });

  it("toggle removes when already present", () => {
    const { result } = renderHook(() => useWishlist());
    act(() => result.current.toggle(sampleProduct));
    act(() => result.current.toggle(sampleProduct));
    expect(result.current.count).toBe(0);
    expect(result.current.isWishlisted("p1")).toBe(false);
  });

  it("remove deletes by id", () => {
    const { result } = renderHook(() => useWishlist());
    act(() => result.current.toggle(sampleProduct));
    act(() => result.current.remove("p1"));
    expect(result.current.count).toBe(0);
  });

  it("clear empties the wishlist", () => {
    const { result } = renderHook(() => useWishlist());
    act(() => result.current.toggle(sampleProduct));
    act(() => result.current.toggle({ ...sampleProduct, _id: "p2" }));
    act(() => result.current.clear());
    expect(result.current.count).toBe(0);
  });

  it("persists across hook instances via localStorage", () => {
    const a = renderHook(() => useWishlist());
    act(() => a.result.current.toggle(sampleProduct));
    const b = renderHook(() => useWishlist());
    expect(b.result.current.isWishlisted("p1")).toBe(true);
  });
});
