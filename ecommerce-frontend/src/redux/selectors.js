import { createSelector } from "@reduxjs/toolkit";
import { getProductRating } from "../utils/productMeta";

/* ───────── Base selectors ───────── */
export const selectAllProducts        = (state) => state.product.products;
export const selectProductById        = (state, id) =>
  state.product.products.find((p) => p._id === id) || null;
export const selectCurrentProduct     = (state) => state.product.currentProduct;
export const selectActiveOffers       = (state) => state.offer.activeOffers;
export const selectCartItems          = (state) => state.cartItems.items;
export const selectCartTotalAmount    = (state) => state.cartItems.totalAmount;
export const selectAuthUser           = (state) => state.auth.user;
export const selectIsCustomer         = (state) => state.auth.user?.role === "user";

/* ───────── Memoized derived selectors ─────────
 * These are computed once per input change and cached, so every component using
 * them gets the same array reference (avoids unnecessary re-renders).         */

export const selectProductsByCategory = createSelector(
  [selectAllProducts],
  (products) => {
    const map = {};
    for (const p of products || []) {
      if (!p?.category) continue;
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    }
    return map;
  }
);

export const selectTopDeals = createSelector(
  [selectAllProducts],
  (products) =>
    [...(products || [])]
      .filter((p) => p.costPrice && p.salePrice && p.costPrice > p.salePrice)
      .map((p) => ({ ...p, _discount: (p.costPrice - p.salePrice) / p.costPrice }))
      .sort((a, b) => b._discount - a._discount)
      .slice(0, 14)
);

export const selectTopRated = createSelector(
  [selectAllProducts],
  (products) =>
    [...(products || [])]
      .map((p) => ({ ...p, _rating: getProductRating(p).rating }))
      .sort((a, b) => b._rating - a._rating)
      .slice(0, 14)
);

export const selectNewArrivals = createSelector(
  [selectAllProducts],
  (products) =>
    [...(products || [])]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 14)
);

export const selectBudgetPicks = createSelector(
  [selectAllProducts],
  (products) => (products || []).filter((p) => p.salePrice <= 999).slice(0, 14)
);

export const selectActiveOfferProductIds = createSelector(
  [selectActiveOffers],
  (offers) => {
    const ids = new Set();
    for (const o of offers || []) {
      for (const p of o.productIds || []) {
        const id = typeof p === "string" ? p : p?._id;
        if (id) ids.add(id);
      }
    }
    return ids;
  }
);

/* Cart-derived */
export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((n, it) => n + (it.quantity || 0), 0)
);

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0)
);

export const selectCartProductIds = createSelector(
  [selectCartItems],
  (items) =>
    new Set(
      items
        .map((it) => it.productId?._id || it.productId)
        .filter(Boolean)
    )
);
