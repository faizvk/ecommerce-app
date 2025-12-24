import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  placeOrder,
  getOrders,
  trackOrder,
  cancelOrder,
  adminGetOrders,
  adminUpdateOrderStatus,
} from "../../api/order.api";

/* Place order (after payment success) */
export const placeOrderThunk = createAsyncThunk(
  "order/place",
  async (shippingAddress, { rejectWithValue }) => {
    try {
      const res = await placeOrder(shippingAddress);
      return res.data.order;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to place order"
      );
    }
  }
);

/* Get all orders for logged-in user */
export const fetchOrdersThunk = createAsyncThunk(
  "order/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getOrders();
      return res.data.orders;
    } catch {
      return rejectWithValue("Failed to load orders");
    }
  }
);

/* Track single order */
export const trackOrderThunk = createAsyncThunk(
  "order/track",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await trackOrder(orderId);
      return res.data.order;
    } catch {
      return rejectWithValue("Unable to load order details");
    }
  }
);

/* Cancel order */
export const cancelOrderThunk = createAsyncThunk(
  "order/cancel",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await cancelOrder(orderId);
      return res.data.order;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Cancel failed");
    }
  }
);

export const adminFetchOrdersThunk = createAsyncThunk(
  "order/adminFetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminGetOrders();
      return res.data.orders;
    } catch {
      return rejectWithValue("Failed to load admin orders");
    }
  }
);

export const adminUpdateOrderStatusThunk = createAsyncThunk(
  "order/adminUpdateStatus",
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const res = await adminUpdateOrderStatus(orderId, status);
      return res.data.order;
    } catch {
      return rejectWithValue("Failed to update order status");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [], // user orders
    adminOrders: [], // admin view
    currentOrder: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearOrderState: (state) => {
      state.currentOrder = null;
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ================= USER ================= */

      // PLACE ORDER
      .addCase(placeOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(placeOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.message = "Order placed successfully";
      })
      .addCase(placeOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH USER ORDERS
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // TRACK ORDER
      .addCase(trackOrderThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(trackOrderThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(trackOrderThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CANCEL ORDER
      .addCase(cancelOrderThunk.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.message = "Order cancelled successfully";
      })
      .addCase(cancelOrderThunk.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ================= ADMIN ================= */

      // ADMIN FETCH
      .addCase(adminFetchOrdersThunk.fulfilled, (state, action) => {
        state.adminOrders = action.payload;
      })

      // ADMIN UPDATE STATUS
      .addCase(adminUpdateOrderStatusThunk.fulfilled, (state, action) => {
        state.adminOrders = state.adminOrders.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;
