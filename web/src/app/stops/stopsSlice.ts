import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import quikStopOrdersApi from "./quikStopOrdersApi";
import { StopOrder } from "../../common/data/StopOrder";
import { LoadingState } from "../LoadingState";
import { handleThunkError } from "../reduxUtils";
import { RootState } from "../store";

export interface StopsState {
  stops: StopOrder[];
  stopsLoading: LoadingState;
  stopsLoadingError?: string;

  created?: StopOrder;
  createdLoading: LoadingState;
  createdLoadingError?: string;

  deleted?: StopOrder;
  deletedLoading: LoadingState;
  deletedLoadingError?: string;
}

export const initialState: StopsState = {
  stops: [],
  stopsLoading: LoadingState.IDLE,
  createdLoading: LoadingState.IDLE,
  deletedLoading: LoadingState.IDLE,
};

export const loadStops = createAsyncThunk<StopOrder[]>(
  "stops/loadStops",
  async (_, thunkAPI) =>
    await handleThunkError(thunkAPI, quikStopOrdersApi.getStopOrders())
);

export const createStop = createAsyncThunk<StopOrder, StopOrder>(
  "stops/createStop",
  async (stop, thunkAPI) =>
    await handleThunkError(thunkAPI, quikStopOrdersApi.createStopOrder(stop))
);

export const deleteStop = createAsyncThunk<StopOrder, number>(
  "stops/deleteStop",
  async (stopNum, thunkAPI) =>
    await handleThunkError(thunkAPI, quikStopOrdersApi.deleteStopOrder(stopNum))
);

export const deleteStopOrdersBySecId = createAsyncThunk<StopOrder, number>(
  "stops/deleteStopOrdersBySecId",
  async (secId, thunkAPI) =>
    await handleThunkError(
      thunkAPI,
      quikStopOrdersApi.deleteStopOrdersBySecId(secId)
    )
);

export const stopsSlice = createSlice({
  name: "stops",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setStops: (state, { payload }: PayloadAction<StopOrder[]>) => {
      state.stops = payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  extraReducers: {
    [loadStops.pending as any]: (state: StopsState) => {
      state.stops = [];
      state.stopsLoading = LoadingState.LOADING;
    },
    [loadStops.fulfilled as any]: (
      state: StopsState,
      action: PayloadAction<StopOrder[]>
    ) => {
      state.stops = action.payload;
      state.stopsLoading = LoadingState.LOADED;
    },
    [loadStops.rejected as any]: (
      state: StopsState,
      action: PayloadAction<any>
    ) => {
      state.stopsLoadingError = action.payload;
      state.stopsLoading = LoadingState.ERROR;
    },
    // createStop
    [createStop.pending as any]: (state: StopsState) => {
      state.created = undefined;
      state.createdLoading = LoadingState.LOADING;
    },
    [createStop.fulfilled as any]: (
      state: StopsState,
      action: PayloadAction<StopOrder>
    ) => {
      state.created = action.payload;
      state.createdLoading = LoadingState.LOADED;
    },
    [createStop.rejected as any]: (
      state: StopsState,
      action: PayloadAction<any>
    ) => {
      state.createdLoadingError = action.payload;
      state.createdLoading = LoadingState.ERROR;
    },
    // deleteStop
    [deleteStop.pending as any]: (state: StopsState) => {
      state.deleted = undefined;
      state.deletedLoading = LoadingState.LOADING;
    },
    [deleteStop.fulfilled as any]: (
      state: StopsState,
      action: PayloadAction<StopOrder>
    ) => {
      state.deleted = action.payload;
      state.deletedLoading = LoadingState.LOADED;
      state.stops = state.stops.filter(
        ({ number }) => number !== action.payload.number
      );
    },
    [deleteStop.rejected as any]: (
      state: StopsState,
      action: PayloadAction<any>
    ) => {
      state.deletedLoadingError = action.payload;
      state.deletedLoading = LoadingState.ERROR;
    },

    // delete all by sec id
    [deleteStopOrdersBySecId.fulfilled as any]: (
      state: StopsState,
      action: PayloadAction<StopOrder[]>
    ) => {
      state.stops = state.stops.filter(
        ({ number }) => !action.payload.find((stop) => stop.number === number)
      );
    },
  },
});

export const { setStops } = stopsSlice.actions;

export const selectStops = createSelector(
  (state: RootState) => ({
    stops: state.stops.stops,
    stopsLoading: state.stops.stopsLoading,
    stopsLoadingError: state.stops.stopsLoadingError,
  }),
  (state) => state
);

export default stopsSlice.reducer;
