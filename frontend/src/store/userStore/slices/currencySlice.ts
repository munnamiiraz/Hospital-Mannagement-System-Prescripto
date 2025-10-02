// src/store/slices/currencySlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CurrencyState {
  symbol: string;
}

const initialState: CurrencyState = {
  symbol: "$",
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrencySymbol: (state, action: PayloadAction<string>) => {
      state.symbol = action.payload;
    },
  },
});

export const { setCurrencySymbol } = currencySlice.actions;
export default currencySlice.reducer;
