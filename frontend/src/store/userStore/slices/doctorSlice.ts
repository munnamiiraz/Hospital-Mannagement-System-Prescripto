// src/store/slices/doctorsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const backendUrl: string = 
  typeof window !== 'undefined' 
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000')
    : 'http://localhost:8000';

export interface Doctor {
  _id: string;
  name: string;
  speciality: string;
  image: string;
  available?: boolean;
  [key: string]: any;
}

export interface DoctorsState {
  backendUrl: string;
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorsState = {
  backendUrl,
  doctors: [],
  loading: false,
  error: null,
};

// NOTE: avoid referencing RootState here to prevent circular imports.
// Use a simple rejectValue and cast getState() to any when reading token.
export const getAllDoctors = createAsyncThunk<
  Doctor[], 
  void,
  { rejectValue: string }
>("doctors/getAllDoctors", async (_, { getState, rejectWithValue }) => {
  try {
    console.log("Fetching doctors from:", `${backendUrl}/api/user/all-doctors`);
    
    const response = await axios.get(`${backendUrl}/api/user/all-doctors`);
    console.log("API Response:", response.data);
    
    const { data, success, message } = response.data;

    if (success && Array.isArray(data)) {
      console.log("Parsed doctors:", data);
      return data as Doctor[];
    } else if (Array.isArray(response.data)) {
      console.log("Direct doctors array:", response.data);
      return response.data as Doctor[];
    } else {
      const msg = message || "Failed to fetch doctors";
      console.error("Error fetching doctors:", msg);
      toast.error(msg);
      return rejectWithValue(msg);
    }
  } catch (error: any) {
    const msg = error?.response?.data?.message || error?.message || "Network Error";
    toast.error(msg);
    return rejectWithValue(msg);
  }
});

const doctorsSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {
    setDoctors: (state, action: PayloadAction<Doctor[]>) => {
      state.doctors = action.payload || [];
    },
    clearDoctors: (state) => {
      state.doctors = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload || [];
      })
      .addCase(getAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error?.message || null;
      });
  },
});

export const { setDoctors, clearDoctors } = doctorsSlice.actions;
export default doctorsSlice.reducer;
