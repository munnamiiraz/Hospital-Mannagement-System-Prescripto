// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import doctorsReducer from "./slices/doctorSlice";
import currencyReducer from "./slices/currencySlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    doctors: doctorsReducer,
    currency: currencyReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;