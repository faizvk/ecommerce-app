import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getActiveOffers,
  adminGetOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
} from "../../api/offer.api";

export const fetchActiveOffersThunk = createAsyncThunk(
  "offer/fetchActive",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getActiveOffers();
      return res.data.offers || [];
    } catch {
      return rejectWithValue("Failed to load offers");
    }
  }
);

export const adminFetchOffersThunk = createAsyncThunk(
  "offer/adminFetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await adminGetOffers();
      return res.data.offers || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to load offers");
    }
  }
);

export const adminCreateOfferThunk = createAsyncThunk(
  "offer/adminCreate",
  async (data, { rejectWithValue }) => {
    try {
      const res = await adminCreateOffer(data);
      return res.data.offer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create offer");
    }
  }
);

export const adminUpdateOfferThunk = createAsyncThunk(
  "offer/adminUpdate",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await adminUpdateOffer(id, data);
      return res.data.offer;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update offer");
    }
  }
);

export const adminDeleteOfferThunk = createAsyncThunk(
  "offer/adminDelete",
  async (id, { rejectWithValue }) => {
    try {
      await adminDeleteOffer(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete offer");
    }
  }
);

const offerSlice = createSlice({
  name: "offer",
  initialState: {
    activeOffers: [],
    adminOffers: [],
    loading: false,
    error: null,
  },
  reducers: {
    pruneExpiredOffers: (state) => {
      const now = Date.now();
      state.activeOffers = state.activeOffers.filter(
        (o) => new Date(o.endTime).getTime() > now
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveOffersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveOffersThunk.fulfilled, (state, action) => {
        state.activeOffers = action.payload;
        state.loading = false;
      })
      .addCase(fetchActiveOffersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(adminFetchOffersThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(adminFetchOffersThunk.fulfilled, (state, action) => {
        state.adminOffers = action.payload;
        state.loading = false;
      })
      .addCase(adminFetchOffersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(adminCreateOfferThunk.fulfilled, (state, action) => {
        state.adminOffers.unshift(action.payload);
      })
      .addCase(adminUpdateOfferThunk.fulfilled, (state, action) => {
        state.adminOffers = state.adminOffers.map((o) =>
          o._id === action.payload._id ? action.payload : o
        );
      })
      .addCase(adminDeleteOfferThunk.fulfilled, (state, action) => {
        state.adminOffers = state.adminOffers.filter((o) => o._id !== action.payload);
      });
  },
});

export const { pruneExpiredOffers } = offerSlice.actions;
export default offerSlice.reducer;
