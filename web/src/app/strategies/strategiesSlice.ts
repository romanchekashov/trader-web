import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { TradingStrategyResult } from "../../common/data/history/TradingStrategyResult";
import { Page } from "../../common/data/Page";
import { TradingStrategyStatus } from "../../common/data/trading/TradingStrategyStatus";
import { LoadingState } from "../LoadingState";
import { handleThunkError } from "../reduxUtils";
import { RootState } from "../store";
import strategiesApi from "./strategiesApi";

export interface StrategiesState {
  strategyResultsRunning: Page<TradingStrategyResult>;
  strategyResultsRunningLoading: LoadingState;
  strategyResultsRunningLoadingError?: string;

  strategyResultsStopped: Page<TradingStrategyResult>;
  strategyResultsStoppedLoading: LoadingState;
  strategyResultsStoppedLoadingError?: string;

  strategyResultsHistory: Page<TradingStrategyResult>;
  strategyResultsHistoryLoading: LoadingState;
  strategyResultsHistoryLoadingError?: string;
}

export const initialState: StrategiesState = {
  strategyResultsRunning: {
    content: [],
    first: false,
    last: false,
    totalElements: 0,
    totalPages: 0
  },
  strategyResultsRunningLoading: LoadingState.IDLE,

  strategyResultsStopped: {
    content: [],
    first: false,
    last: false,
    totalElements: 0,
    totalPages: 0
  },
  strategyResultsStoppedLoading: LoadingState.IDLE,

  strategyResultsHistory: {
    content: [],
    first: false,
    last: false,
    totalElements: 0,
    totalPages: 0
  },
  strategyResultsHistoryLoading: LoadingState.IDLE
};

export const loadStrategiesRunning = createAsyncThunk<Page<TradingStrategyResult>, { page: number, size: number }>(
  "strategies/loadStrategiesRunning",
  async (data, thunkAPI) =>
    await handleThunkError(thunkAPI, strategiesApi.getAllStrategies(TradingStrategyStatus.RUNNING, data.page, data.size))
);

export const loadStrategiesStopped = createAsyncThunk<Page<TradingStrategyResult>, { page: number, size: number }>(
  "strategies/loadStrategiesStopped",
  async (data, thunkAPI) =>
    await handleThunkError(thunkAPI, strategiesApi.getAllStrategies(TradingStrategyStatus.STOPPED, data.page, data.size))
);

export const loadStrategiesHistory = createAsyncThunk<Page<TradingStrategyResult>, { page: number, size: number }>(
  "strategies/loadStrategiesHistory",
  async (data, thunkAPI) =>
    await handleThunkError(thunkAPI, strategiesApi.getAllStrategies(TradingStrategyStatus.FINISHED, data.page, data.size))
);

export const strategiesSlice = createSlice({
  name: "strategies",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setRunning: (state, { payload }: PayloadAction<TradingStrategyResult[]>) => {
      state.strategyResultsRunning = {
        ...initialState.strategyResultsRunning,
        content: payload,
        totalElements: payload.length,
        totalPages: 1
      };
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  extraReducers: {
    [loadStrategiesRunning.pending as any]: (state: StrategiesState) => {
      state.strategyResultsRunningLoading = LoadingState.LOADING;
    },
    [loadStrategiesRunning.fulfilled as any]: (
      state: StrategiesState,
      action: PayloadAction<Page<TradingStrategyResult>>
    ) => {
      state.strategyResultsRunning = action.payload;
      state.strategyResultsRunningLoading = LoadingState.LOADED;
    },
    [loadStrategiesRunning.rejected as any]: (
      state: StrategiesState,
      action: PayloadAction<any>
    ) => {
      state.strategyResultsRunningLoadingError = action.payload;
      state.strategyResultsRunningLoading = LoadingState.ERROR;
    },
    // stopped
    [loadStrategiesStopped.pending as any]: (state: StrategiesState) => {
      state.strategyResultsStoppedLoading = LoadingState.LOADING;
    },
    [loadStrategiesStopped.fulfilled as any]: (
      state: StrategiesState,
      action: PayloadAction<Page<TradingStrategyResult>>
    ) => {
      state.strategyResultsStopped = action.payload;
      state.strategyResultsStoppedLoading = LoadingState.LOADED;
    },
    [loadStrategiesStopped.rejected as any]: (
      state: StrategiesState,
      action: PayloadAction<any>
    ) => {
      state.strategyResultsStoppedLoadingError = action.payload;
      state.strategyResultsStoppedLoading = LoadingState.ERROR;
    },
    // history
    [loadStrategiesHistory.pending as any]: (state: StrategiesState) => {
      state.strategyResultsHistoryLoading = LoadingState.LOADING;
    },
    [loadStrategiesHistory.fulfilled as any]: (
      state: StrategiesState,
      action: PayloadAction<Page<TradingStrategyResult>>
    ) => {
      state.strategyResultsHistory = action.payload;
      state.strategyResultsHistoryLoading = LoadingState.LOADED;
    },
    [loadStrategiesHistory.rejected as any]: (
      state: StrategiesState,
      action: PayloadAction<any>
    ) => {
      state.strategyResultsHistoryLoadingError = action.payload;
      state.strategyResultsHistoryLoading = LoadingState.ERROR;
    },
  },
});

export const { setRunning } = strategiesSlice.actions;

export const selectStrategies = createSelector(
  (state: RootState) => ({
    strategyResultsRunning: state.strategies.strategyResultsRunning,
    strategyResultsRunningLoading: state.strategies.strategyResultsRunningLoading,
    strategyResultsRunningLoadingError: state.strategies.strategyResultsRunningLoadingError,

    strategyResultsStopped: state.strategies.strategyResultsStopped,
    strategyResultsStoppedLoading: state.strategies.strategyResultsStoppedLoading,
    strategyResultsStoppedLoadingError: state.strategies.strategyResultsStoppedLoadingError,

    strategyResultsHistory: state.strategies.strategyResultsHistory,
    strategyResultsHistoryLoading: state.strategies.strategyResultsHistoryLoading,
    strategyResultsHistoryLoadingError: state.strategies.strategyResultsHistoryLoadingError,
  }),
  (state) => state
);

export default strategiesSlice.reducer;
