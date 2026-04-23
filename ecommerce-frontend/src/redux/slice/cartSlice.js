import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart } from "../../api/cart.api";
import {
  fetchCartThunk,
  addToCartThunk,
  removeFromCartThunk,
  increaseQtyThunk,
  decreaseQtyThunk,
} from "./cartItemsSlice";

export const refreshCartCountThunk = createAsyncThunk(
  "cart/refreshCount",
  async (_, { getState }) => {
    const { auth } = getState();
    const user = auth.user;

    if (!user || user.role !== "user") return { count: 0 };

    try {
      const res = await getCart();
      const items = res.data.cart?.products ?? [];
      const count = items.reduce((sum, item) => sum + item.quantity, 0);
      return { count };
    } catch {
      return { count: 0 };
    }
  }
);

const countFromCart = (cart) =>
  (cart?.products ?? []).reduce((sum, item) => sum + item.quantity, 0);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCart: (state) => {
      state.count = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* Explicit refresh */
      .addCase(refreshCartCountThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(refreshCartCountThunk.fulfilled, (state, action) => {
        state.count = action.payload.count;
        state.loading = false;
      })
      .addCase(refreshCartCountThunk.rejected, (state) => {
        state.count = 0;
        state.loading = false;
      })

      /* Derive count directly from cartItems thunk results — no extra API call */
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.count = countFromCart(action.payload);
      })
      .addCase(addToCartThunk.fulfilled, (state, action) => {
        state.count = countFromCart(action.payload);
      })
      .addCase(removeFromCartThunk.fulfilled, (state, action) => {
        state.count = countFromCart(action.payload);
      })
      .addCase(increaseQtyThunk.fulfilled, (state, action) => {
        state.count = countFromCart(action.payload);
      })
      .addCase(decreaseQtyThunk.fulfilled, (state, action) => {
        state.count = countFromCart(action.payload);
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
