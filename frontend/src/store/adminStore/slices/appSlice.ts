import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  // Add other user properties as needed
}

interface AppState {
  isLoggedIn: boolean;
  user: User | null;
}

// Initial state with proper typing
const initialState: AppState = {
  isLoggedIn: false,
  user: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateUser } = appSlice.actions;
export default appSlice.reducer;

// Export types for use in other files
export type { AppState, User };