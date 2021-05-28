import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import analysisRestApi from "../../common/api/rest/analysisRestApi";
import { PatternResult } from "../../common/components/alerts/data/PatternResult";
import { NotificationDto } from "../../common/components/notifications/data/NotificationDto";
import { FilterDto } from "../../common/data/FilterDto";
import { Signal } from "../../common/data/Signal";
import { LoadingState } from "../LoadingState";
import { handleThunkError } from "../reduxUtils";
import { RootState } from "../store";
import notificationsRestApi from "./notificationsApi";

export interface NotificationsState {
  notifications: NotificationDto[];
  notificationsLoading: LoadingState;
  notificationsLoadingError?: string;

  signals: PatternResult[];
  signalsLoading: LoadingState;
  signalsLoadingError?: string;

  newSignals: Map<number, Signal[]>;
}

export const initialState: NotificationsState = {
  notifications: [],
  notificationsLoading: LoadingState.IDLE,
  signals: [],
  signalsLoading: LoadingState.IDLE,
  newSignals: new Map(),
};

export const loadNotifications = createAsyncThunk<NotificationDto[], FilterDto>(
  "notifications/loadNotifications",
  async (filter, thunkAPI) =>
    await handleThunkError(
      thunkAPI,
      notificationsRestApi.getNotifications(filter)
    )
);

export const loadSignals = createAsyncThunk<PatternResult[], FilterDto>(
  "notifications/loadSignals",
  async (filter, thunkAPI) =>
    await handleThunkError(thunkAPI, analysisRestApi.getCandlePatterns(filter))
);

export const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setNotifications: (
      state,
      { payload }: PayloadAction<NotificationDto[]>
    ) => {
      state.notifications = payload;
    },
    setSignals: (state, { payload }: PayloadAction<PatternResult[]>) => {
      state.signals = payload;
    },
    addNewSignals: (state, { payload }: PayloadAction<Signal[]>) => {
      if (payload.length) {
        state.newSignals.set(payload[0].secId, payload);
      }
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  extraReducers: {
    [loadNotifications.pending as any]: (state: NotificationsState) => {
      // state.futuresClientLimits = [];
      state.notificationsLoading = LoadingState.LOADING;
    },
    [loadNotifications.fulfilled as any]: (
      state: NotificationsState,
      action: PayloadAction<NotificationDto[]>
    ) => {
      state.notifications = action.payload;
      state.notificationsLoading = LoadingState.LOADED;
    },
    [loadNotifications.rejected as any]: (
      state: NotificationsState,
      action: PayloadAction<any>
    ) => {
      state.notificationsLoadingError = action.payload;
      state.notificationsLoading = LoadingState.ERROR;
    },
    // signals
    [loadSignals.pending as any]: (state: NotificationsState) => {
      // state.futuresClientLimits = [];
      state.signalsLoading = LoadingState.LOADING;
    },
    [loadSignals.fulfilled as any]: (
      state: NotificationsState,
      action: PayloadAction<PatternResult[]>
    ) => {
      state.signals = action.payload;
      state.signalsLoading = LoadingState.LOADED;
      state.signalsLoadingError = undefined;
    },
    [loadSignals.rejected as any]: (
      state: NotificationsState,
      action: PayloadAction<any>
    ) => {
      state.signalsLoadingError = action.payload;
      state.signalsLoading = LoadingState.ERROR;
    },
  },
});

export const { setNotifications, setSignals, addNewSignals } =
  notificationsSlice.actions;

export const selectNotifications = createSelector(
  (state: RootState) => ({
    notifications: state.notifications.notifications,
    notificationsLoading: state.notifications.notificationsLoading,
    notificationsLoadingError: state.notifications.notificationsLoadingError,
  }),
  (state) => state
);

export const selectSignals = createSelector(
  (state: RootState) => ({
    newSignals: state.notifications.newSignals,
    signals: state.notifications.signals,
    signalsLoading: state.notifications.signalsLoading,
    signalsLoadingError: state.notifications.signalsLoadingError,
  }),
  (state) => state
);

export default notificationsSlice.reducer;