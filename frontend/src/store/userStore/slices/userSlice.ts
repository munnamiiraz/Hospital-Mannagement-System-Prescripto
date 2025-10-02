// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl: string = 
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000')
    : 'http://localhost:9000';

export interface UserData {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface UserState {
  token: string | null;
  backendUrl: string;
  loading: boolean;
  error: string | null;
  userData: UserData | null;
}

const initialState: UserState = {
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  backendUrl,
  loading: false,
  error: null,
  userData: null,
};

// avoid RootState import here; cast getState() as any when reading token
export const loadUserProfileData = createAsyncThunk<
  UserData, // fulfilled return
  void,
  { rejectValue: string }
>("user/loadUserProfileData", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const token = state?.user?.token;
    if (!token) {
      return rejectWithValue("No token available");
    }

    const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
      headers: { token },
    });

    if (data) {
      const ok =
        data.success === true ||
        data.statusCode === 200 ||
        (data.data !== undefined && data.data !== null);

      if (ok) {
        return (data.data ?? data) as UserData;
      } else {
        const msg = data.message || "Failed to load profile";
        toast.error(msg);
        return rejectWithValue(msg);
      }
    } else {
      const msg = "Invalid response from server";
      toast.error(msg);
      return rejectWithValue(msg);
    }
  } catch (error: any) {
    console.error("loadUserProfileData error:", error);
    const msg = error?.response?.data?.message ?? error?.message ?? "Network Error";
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      const token = action.payload;
      state.token = token;
      if (typeof window !== "undefined") {
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
      }
    },
    setUserData: (state, action: PayloadAction<UserData | null>) => {
      state.userData = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
      state.userData = null;
      if (typeof window !== "undefined") localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProfileData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserProfileData.fulfilled, (state, action) => {
        state.loading = false;
        state.userData = action.payload;
        state.error = null;
      })
      .addCase(loadUserProfileData.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load profile";
        state.userData = null;
      });
  },
});

export const { setToken, setUserData, clearToken } = userSlice.actions;
export default userSlice.reducer;
