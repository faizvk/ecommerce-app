import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  signup,
  getProfile,
  updateProfile,
  updatePassword,
  getAllUsers,
  updateUserRole,
} from "../../api/user.api";

/* =========================
   THUNKS
========================= */

export const signupThunk = createAsyncThunk(
  "user/signup",
  async (data, { rejectWithValue }) => {
    try {
      const res = await signup(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  }
);

/* Fetch logged-in user's profile */
export const fetchProfileThunk = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getProfile();
      return res.data.user;
    } catch {
      return rejectWithValue("Failed to load profile");
    }
  }
);

/* Update profile */
export const updateProfileThunk = createAsyncThunk(
  "user/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const res = await updateProfile(data);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Profile update failed"
      );
    }
  }
);

/* Update password */
export const updatePasswordThunk = createAsyncThunk(
  "user/updatePassword",
  async (data, { rejectWithValue }) => {
    try {
      await updatePassword(data);
      return true;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Password update failed"
      );
    }
  }
);

/* =========================
   ADMIN THUNKS
========================= */

export const fetchAllUsersThunk = createAsyncThunk(
  "user/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllUsers();
      return res.data.users || [];
    } catch {
      return rejectWithValue("Failed to load users");
    }
  }
);

export const updateUserRoleThunk = createAsyncThunk(
  "user/updateRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const res = await updateUserRole(id, role);
      return res.data.user;
    } catch {
      return rejectWithValue("Failed to update user role");
    }
  }
);

/* =========================
   SLICE
========================= */

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: null, // logged-in user's profile
    users: [], // admin user list
    loading: false,
    error: null,
    success: null, // generic success message
  },

  reducers: {
    clearUserState: (state) => {
      state.error = null;
      state.success = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ---------- SIGNUP ---------- */
      .addCase(signupThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = null;
      })
      .addCase(signupThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = "Signup successful";
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH PROFILE ---------- */
      .addCase(fetchProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- UPDATE PROFILE ---------- */
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.loading = false;
        state.success = "Profile updated successfully";
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- UPDATE PASSWORD ---------- */
      .addCase(updatePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = "Password updated successfully";
      })
      .addCase(updatePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- ADMIN: FETCH USERS ---------- */
      .addCase(fetchAllUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsersThunk.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- ADMIN: UPDATE USER ROLE ---------- */
      .addCase(updateUserRoleThunk.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        );
        state.success = "User role updated";
      });
  },
});

export const { clearUserState } = userSlice.actions;
export default userSlice.reducer;
