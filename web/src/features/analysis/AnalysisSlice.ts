import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { LoadingState } from "../../app/LoadingState";
import { handleThunkError } from "../../app/reduxUtils";
import { RootState } from "../../app/store";
import botControlRestApi from "../../app/strategies/botControlRestApi";
import { MarketBotFilterDataDto } from "../../common/data/bot/MarketBotFilterDataDto";

export interface AnalysisState {
  filter?: MarketBotFilterDataDto;
  filterLoading: LoadingState;
  filterLoadingError?: string;
}

export const initialState: AnalysisState = {
  filterLoading: LoadingState.IDLE,
};

export const loadFilterData = createAsyncThunk<MarketBotFilterDataDto, boolean>(
  "analysis/loadFilterData",
  async (history, thunkAPI) =>
    await handleThunkError(thunkAPI, botControlRestApi.getFilterData(history))
);

export const analysisSlice = createSlice({
  name: "analysis",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {},
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  extraReducers: {
    [loadFilterData.pending as any]: (state: AnalysisState) => {
      state.filter = undefined;
      state.filterLoading = LoadingState.LOADING;
    },
    [loadFilterData.fulfilled as any]: (
      state: AnalysisState,
      action: PayloadAction<MarketBotFilterDataDto>
    ) => {
      state.filter = action.payload;
      state.filterLoading = LoadingState.LOADED;
    },
    [loadFilterData.rejected as any]: (
      state: AnalysisState,
      action: PayloadAction<any>
    ) => {
      state.filterLoadingError = action.payload;
      state.filterLoading = LoadingState.ERROR;
    },
  },
});

export const selectFilter = createSelector(
  (state: RootState) => ({
    filter: state.analysis.filter,
    filterLoading: state.analysis.filterLoading,
    filterLoadingError: state.analysis.filterLoadingError,
  }),
  (state) => state
);

export default analysisSlice.reducer;
