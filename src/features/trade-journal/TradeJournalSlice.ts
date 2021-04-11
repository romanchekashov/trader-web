import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { TradeJournalState } from "./TradeJournalActions";

export const initialState: TradeJournalState = {
    stat: [],
};

export const tradeJournalSlice = createSlice({
    name: "tradeJournal",
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {},
    // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
    extraReducers: {},
});

export default tradeJournalSlice.reducer;
