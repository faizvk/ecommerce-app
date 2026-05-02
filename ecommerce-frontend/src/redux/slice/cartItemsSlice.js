import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addToCart,
  removeFromCart,
  increaseQty,
  decreaseQty,
} from "../../api/cart.api";

const extractCart = (res) => res.data.cart;

/* ================= FETCH CART ================= */
export const fetchCartThunk = createAsyncThunk(
  "cartItems/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCart();
      return res.data.cart;
    } catch {
      return rejectWithValue("Failed to load cart");
    }
  }
);

/* ================= ADD ITEM ================= */
export const addToCartThunk = createAsyncThunk(
  "cartItems/add",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const res = await addToCart(productId, quantity);
      return extractCart(res);
    } catch {
      return rejectWithValue("Failed to add item");
    }
  }
);

/* ================= REMOVE ITEM ================= */
export const removeFromCartThunk = createAsyncThunk(
  "cartItems/remove",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await removeFromCart(productId);
      return extractCart(res);
    } catch {
      return rejectWithValue("Failed to remove item");
    }
  }
);

/* ================= INCREASE QTY ================= */
export const increaseQtyThunk = createAsyncThunk(
  "cartItems/increaseQty",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await increaseQty(productId);
      return extractCart(res);
    } catch {
      return rejectWithValue("Failed to increase quantity");
    }
  }
);

/* ================= DECREASE QTY ================= */
export const decreaseQtyThunk = createAsyncThunk(
  "cartItems/decreaseQty",
  async (productId, { rejectWithValue }) => {
    try {
      const res = await decreaseQty(productId);
      return extractCart(res);
    } catch {
      return rejectWithValue("Failed to decrease quantity");
    }
  }
);

/* ================= HELPERS ================= */
const applyCart = (state, cart) => {
  state.loading = false;
  state.cart = cart || null;
  state.items = cart?.products ?? [];
  state.totalAmount = cart?.totalAmount ?? 0;
};

/* ================= SLICE ================= */
const cartItemsSlice = createSlice({
  name: "cartItems",

  initialState: {
    cart: null,
    items: [],
    totalAmount: 0,
    loading: false,
    error: null,
  },

  reducers: {
    clearCartItemsState: (state) => {
      state.cart = null;
      state.items = [];
      state.totalAmount = 0;
      state.loading = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchCartThunk.pending, pending)
      .addCase(fetchCartThunk.fulfilled, (state, action) => { applyCart(state, action.payload); })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totalAmount = 0;
        state.error = action.payload;
      })

      .addCase(addToCartThunk.pending, pending)
      .addCase(addToCartThunk.fulfilled, (state, action) => { applyCart(state, action.payload); })
      .addCase(addToCartThunk.rejected, rejected)

      .addCase(removeFromCartThunk.pending, pending)
      .addCase(removeFromCartThunk.fulfilled, (state, action) => { applyCart(state, action.payload); })
      .addCase(removeFromCartThunk.rejected, rejected)

      .addCase(increaseQtyThunk.pending, pending)
      .addCase(increaseQtyThunk.fulfilled, (state, action) => { applyCart(state, action.payload); })
      .addCase(increaseQtyThunk.rejected, rejected)

      .addCase(decreaseQtyThunk.pending, pending)
      .addCase(decreaseQtyThunk.fulfilled, (state, action) => { applyCart(state, action.payload); })
      .addCase(decreaseQtyThunk.rejected, rejected)

      // Reset cart whenever auth state changes (login/logout/session-expire) so cart
      // items never leak between users. Use string action types to avoid circular imports.
      .addMatcher(
        (action) => /^auth\/(login|logout|restoreSession)\/fulfilled$/.test(action.type) ||
                    /^auth\/restoreSession\/rejected$/.test(action.type),
        (state) => {
          state.cart = null;
          state.items = [];
          state.totalAmount = 0;
          state.loading = false;
          state.error = null;
        }
      );
  },
});

export const { clearCartItemsState } = cartItemsSlice.actions;
export default cartItemsSlice.reducer;
