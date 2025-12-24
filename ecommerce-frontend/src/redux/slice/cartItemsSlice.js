import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCart,
  addToCart,
  removeFromCart,
  increaseQty,
  decreaseQty,
} from "../../api/cart.api";

/* Fetch full cart */
export const fetchCartThunk = createAsyncThunk(
  "cartItems/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getCart();
      return res.data.cart;
    } catch (err) {
      return rejectWithValue("Failed to load cart");
    }
  }
);

/* Add item */
export const addToCartThunk = createAsyncThunk(
  "cartItems/add",
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      await addToCart(productId, quantity);
      return productId;
    } catch {
      return rejectWithValue("Failed to add item");
    }
  }
);

/* Remove item */
export const removeFromCartThunk = createAsyncThunk(
  "cartItems/remove",
  async (productId, { rejectWithValue }) => {
    try {
      await removeFromCart(productId);
      return productId;
    } catch {
      return rejectWithValue("Failed to remove item");
    }
  }
);

/* Increase quantity */
export const increaseQtyThunk = createAsyncThunk(
  "cartItems/increaseQty",
  async (productId, { rejectWithValue }) => {
    try {
      await increaseQty(productId);
      return productId;
    } catch {
      return rejectWithValue("Failed to increase quantity");
    }
  }
);

/* Decrease quantity */
export const decreaseQtyThunk = createAsyncThunk(
  "cartItems/decreaseQty",
  async (productId, { rejectWithValue }) => {
    try {
      await decreaseQty(productId);
      return productId;
    } catch {
      return rejectWithValue("Failed to decrease quantity");
    }
  }
);

const cartItemsSlice = createSlice({
  name: "cartItems",
  initialState: {
    cart: null, // full cart object
    items: [], // convenience mirror of cart.products
    totalAmount: 0,
    loading: false,
    error: null,
  },

  reducers: {
    clearCartItemsState: (state) => {
      state.cart = null;
      state.items = [];
      state.totalAmount = 0;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- FETCH CART ---------- */
      .addCase(fetchCartThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload?.products || [];
        state.totalAmount = action.payload?.totalAmount || 0;
      })
      .addCase(fetchCartThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- MUTATIONS (REFRESH AFTER) ---------- */
      .addCase(addToCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(removeFromCartThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCartThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(increaseQtyThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(increaseQtyThunk.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(decreaseQtyThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(decreaseQtyThunk.fulfilled, (state) => {
        state.loading = false;
      });
  },
});

export const { clearCartItemsState } = cartItemsSlice.actions;
export default cartItemsSlice.reducer;
