import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "@/services/api-client-rq";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  email_verified: boolean;
  phone_verified: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  initialized: false,
  error: null,
};

const clearClientCaches = () => {
  try {
    const cacheKeys = [
      "user_cache",
      "categories_cache",
      "branches_cache",
      "addresses_cache",
      "restaurant-cart",
    ];
    cacheKeys.forEach((key) => localStorage.removeItem(key));

    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("products_cache_") ||
        key.startsWith("product_") ||
        key.startsWith("orders_cache_")
      ) {
        localStorage.removeItem(key);
      }
    });
  } catch {
    // Ignore storage access errors on restricted environments
  }
};

export const fetchMe = createAsyncThunk<User | null>(
  "auth/fetchMe",
  async () => {
    try {
      const result: any = await api.auth.getMe();
      return result?.data?.user ?? null;
    } catch {
      return null;
    }
  }
);

export const signInThunk = createAsyncThunk<
  void,
  { email: string; password: string },
  { rejectValue: string }
>("auth/signIn", async ({ email, password }, { dispatch, rejectWithValue }) => {
  try {
    await api.auth.signIn(email, password);
    await dispatch(fetchMe()).unwrap();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to sign in");
  }
});

export const signUpThunk = createAsyncThunk<
  void,
  { email: string; password: string; full_name: string; phone: string },
  { rejectValue: string }
>("auth/signUp", async (payload, { dispatch, rejectWithValue }) => {
  try {
    await api.auth.signUp(payload);
    await dispatch(fetchMe()).unwrap();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to sign up");
  }
});

export const signOutThunk = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    try {
      await api.auth.signOut();
      clearClientCaches();
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to sign out");
    }
  }
);

export const updateProfileThunk = createAsyncThunk<
  void,
  { full_name?: string; phone?: string },
  { rejectValue: string }
>("auth/updateProfile", async (payload, { dispatch, rejectWithValue }) => {
  try {
    await api.auth.updateProfile(payload);
    await dispatch(fetchMe()).unwrap();
  } catch (error: any) {
    return rejectWithValue(error?.message || "Failed to update profile");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.initialized = true;
        state.error = action.error.message || "Failed to fetch user";
      })
      .addCase(signInThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signInThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || "Failed to sign in";
      })
      .addCase(signUpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message || "Failed to sign up";
      })
      .addCase(signOutThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signOutThunk.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(signOutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to sign out";
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || action.error.message || "Failed to update profile";
      });
  },
});

export default authSlice.reducer;
