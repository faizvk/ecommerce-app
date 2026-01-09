import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/api";

/* ---------- LOGIN ---------- */
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
      return rejectWithValue(err.response?.data?.message || "LOGIN_FAILED");
    }
  }
);

/* ---------- RESTORE SESSION ---------- */
export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return rejectWithValue("No session");
    }

    try {
      // Let cookies + interceptor handle auth
      const res = await api.post("/refresh");

      const newAccessToken = res.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);

      return {
        user: JSON.parse(storedUser),
        accessToken: newAccessToken,
      };
    } catch {
      localStorage.clear();
      return rejectWithValue("Session expired");
    }
  }
);

/* ---------- LOGOUT ---------- */
export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await api.post("/logout");
  localStorage.clear();
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    accessToken: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      const { user, accessToken } = action.payload;

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("accessToken", accessToken);

      state.user = user;
      state.accessToken = accessToken;
      state.loading = false;
      state.error = null;
    },

    logout: (state) => {
      localStorage.clear();
      state.user = null;
      state.accessToken = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
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

export const { logout, loginSuccess } = authSlice.actions;
export default authSlice.reducer;
