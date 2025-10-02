import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./slices/appSlice";
import adminReducer from "./slices/adminSlice"
export const store = configureStore({
  reducer: {
    app: appReducer,
    admin: adminReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Optional: Export a type for the store itself
export type AppStore = typeof store;