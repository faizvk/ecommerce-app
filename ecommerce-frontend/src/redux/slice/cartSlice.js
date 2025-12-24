import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCart } from "../../api/cart.api";

export const refreshCartCountThunk = createAsyncThunk(
  "cart/refreshCount",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();
    const user = auth.user;
    const token = localStorage.getItem("accessToken");

    // 🚫 Block unauthenticated users and admins
    if (!user || !token || user.role !== "user") {
      return { count: 0 };
    }

    try {
      const res = await getCart();
      const items = res.data.cart?.products || [];

      const count = items.reduce((sum, item) => sum + item.quantity, 0);

      return { count };
    } catch (err) {
      return rejectWithValue("Failed to load cart");
    }
  }
);

/* =========================
   SLICE
========================= */
const cartSlice = createSlice({
  name: "cart",
  initialState: {
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {
    /**
     * Clear cart state (used on logout)
     */
    clearCart: (state) => {
      state.count = 0;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- REFRESH CART COUNT ---------- */
      .addCase(refreshCartCountThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshCartCountThunk.fulfilled, (state, action) => {
        state.count = action.payload.count;
        state.loading = false;
      })
      .addCase(refreshCartCountThunk.rejected, (state, action) => {
        state.count = 0;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
