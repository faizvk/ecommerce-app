import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

/* =========================
   LOGIN THUNK
========================= */
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await api.post("/login", credentials);

      const { user, accessToken } = res.data;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);

      return { user, accessToken };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  }
);

/* =========================
   RESTORE SESSION THUNK
========================= */
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (!storedUser || !storedToken) {
      return rejectWithValue("No active session");
    }

    try {
      // Attempt token refresh / validation
      await api.post("/refresh");

      return {
        user: JSON.parse(storedUser),
        accessToken: storedToken,
      };
    } catch (err) {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      return rejectWithValue("Session expired");
    }
  }
);

/* =========================
   AUTH SLICE
========================= */
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    loading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");

      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ---------- RESTORE SESSION ---------- */
      .addCase(restoreSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loading = false;
      })
      .addCase(restoreSession.rejected, (state, action) => {
        state.user = null;
        state.accessToken = null;
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- LOGIN ---------- */
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.loading = false;
        state.error = null;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
