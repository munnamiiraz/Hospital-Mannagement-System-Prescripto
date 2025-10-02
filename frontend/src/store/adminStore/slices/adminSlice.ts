import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';
import { toast } from "react-toastify";

// Extend ImportMeta interface to include Vite's env
declare global {
  interface ImportMeta {
    env: {
      NEXT_PUBLIC_BACKEND_URL?: string;
      // Add other Vite environment variables here as needed
      [key: string]: string | undefined;
    };
  }
}

// Type definitions
interface DoctorAddress {
  address: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

interface Doctor {
  _id: string;
  name: string;
  email: string;
  image: string;
  speciality: string;
  degree: string;
  experience: string;
  fees: number;
  about: string;
  address: DoctorAddress;
  available: boolean;
  date: number;
  slots_booked?: Record<string, string[]>;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

interface AdminState {
  aToken: string;
  backendUrl: string;
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}

interface ChangeAvailabilityParams {
  docId: string;
  aToken: string;
}

// Backend URL with proper typing
const backendUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const initialState: AdminState = {
  aToken: '',
  backendUrl,
  doctors: [],
  loading: false,
  error: null,
};

// Helper function to handle error messages
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
};

// Async thunks
export const getAllDoctors = createAsyncThunk<
  Doctor[], // Return type
  string, // Argument type (aToken)
  { rejectValue: string } // ThunkAPI type
>(
  'admin/getAllDoctors',
  async (aToken: string, { rejectWithValue }) => {
    try {
      const { data }: { data: ApiResponse<Doctor[]> } = await axios.post(
        `${backendUrl}/api/admin/all-doctors`,
        {},
        { headers: { token: aToken } }
      );
      
      if (data.success) {
        console.log(data);
        return data.data || [];
      } else {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const changeAvailablity = createAsyncThunk<
  Doctor, // Return type
  ChangeAvailabilityParams, // Argument type
  { rejectValue: string } // ThunkAPI type
>(
  'admin/changeAvailablity',
  async ({ docId, aToken }: ChangeAvailabilityParams, { dispatch, rejectWithValue }) => {
    try {
      const { data }: { data: ApiResponse<Doctor> } = await axios.post(
        `${backendUrl}/api/admin/change-availablity`,
        { docId },
        { headers: { token: aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        console.log(data);
        // Refresh the doctors list
        dispatch(getAllDoctors(aToken));
        return data.data!; // Non-null assertion since we know it exists when success is true
      } else {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAToken: (state, action: PayloadAction<string>) => {
      state.aToken = action.payload; // login এর সময় token save করা
    },
    clearAToken: (state) => {
      state.aToken = '';
      state.doctors = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllDoctors cases
      .addCase(getAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDoctors.fulfilled, (state, action: PayloadAction<Doctor[]>) => {
        state.loading = false;
        state.doctors = action.payload; // API থেকে পাওয়া doctors save করা
        state.error = null;
      })
      .addCase(getAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch doctors'; // error message save করা
      })

      // changeAvailablity cases
      .addCase(changeAvailablity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeAvailablity.fulfilled, (state, action: PayloadAction<Doctor>) => {
        state.loading = false;
        const updatedDoctor = action.payload;
        
        if (updatedDoctor) {
          const idx = state.doctors.findIndex(d => d._id === updatedDoctor._id);
          if (idx !== -1) {
            state.doctors[idx] = updatedDoctor;
          } else {
            // If doctor not found in list, add it (edge case)
            state.doctors.push(updatedDoctor);
          }
        }
        state.error = null;
      })
      .addCase(changeAvailablity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to change doctor availability';
      });
  },
});

export const { setAToken, clearAToken, clearError } = adminSlice.actions;
export default adminSlice.reducer;

// Export types for use in other files
export type { AdminState, Doctor, DoctorAddress, ApiResponse, ChangeAvailabilityParams };