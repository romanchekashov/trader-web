import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";
import tinkoffInvestRestApi from "../../common/api/rest/tinkoffInvestRestApi";
import { BrokerId } from "../../common/data/BrokerId";
import { SecurityCurrency } from "../../common/data/security/SecurityCurrency";
import { SecurityFuture } from "../../common/data/security/SecurityFuture";
import { SecurityInfo } from "../../common/data/security/SecurityInfo";
import { SecurityLastInfo } from "../../common/data/security/SecurityLastInfo";
import { SecurityShare } from "../../common/data/security/SecurityShare";
import { SecurityTypeWrapper } from "../../common/data/security/SecurityTypeWrapper";
import { TradingPlatform } from "../../common/data/trading/TradingPlatform";
import { SEC_MAP } from "../../common/utils/Cache";
import { sortSecurities } from "../../common/utils/DataUtils";
import { LoadingState } from "../LoadingState";
import { handleThunkError } from "../reduxUtils";
import { RootState } from "../store";
import securitiesApi from "./securitiesApi";

export enum DayAndEvening {
  day = 'day',
  evening = 'evening'
}

export interface SecuritiesState {
  security?: SecurityLastInfo;
  securities: SecurityLastInfo[];
  securitiesLoading: LoadingState;
  securitiesLoadingError?: string;

  selectedSecurityTypeWrapper: SecurityTypeWrapper;
  selectedBrokerId: BrokerId;
  selectedTradingPlatform: TradingPlatform;

  securityInfoMap: Map<number, SecurityInfo>;

  shares: SecurityShare[];
  currencies: SecurityCurrency[];
  futures: SecurityFuture[];

  sessions: DayAndEvening[];
}

const initialState: SecuritiesState = {
  securities: [],
  securitiesLoading: LoadingState.IDLE,
  selectedSecurityTypeWrapper: SecurityTypeWrapper.FUTURE,
  selectedBrokerId: BrokerId.ALFA_DIRECT,
  selectedTradingPlatform: TradingPlatform.QUIK,
  securityInfoMap: new Map(),
  shares: [],
  currencies: [],
  futures: [],
  sessions: [DayAndEvening.day, DayAndEvening.evening]
};

// https://www.newline.co/@bespoyasov/how-to-use-thunks-with-redux-toolkit-and-typescript--1e65fc64
export const loadLastSecurities = createAsyncThunk<SecurityLastInfo[]>(
  "securities/loadLastSecurities",
  async (_, thunkAPI) => {
    let securities = await handleThunkError(thunkAPI, securitiesApi.getLastSecurities());
    sortSecurities(securities);
    return securities;
  });
export const loadShares = createAsyncThunk<SecurityShare[]>(
  "securities/loadShares",
  async (_, thunkAPI) =>
    await handleThunkError(thunkAPI, securitiesApi.getAllSecurityShares())
);
export const loadFutures = createAsyncThunk<SecurityFuture[]>(
  "securities/loadFutures",
  async (_, thunkAPI) =>
    await handleThunkError(thunkAPI, securitiesApi.getAllSecurityFutures())
);
export const loadCurrencies = createAsyncThunk<SecurityCurrency[]>(
  "securities/loadCurrencies",
  async (_, thunkAPI) =>
    await handleThunkError(thunkAPI, securitiesApi.getAllSecurityCurrencies())
);
// tinkoff
export const loadLastSecuritiesTinkoff = createAsyncThunk<SecurityLastInfo[]>(
  "securities/loadLastSecuritiesTinkoff",
  async (_, thunkAPI) =>
    await handleThunkError(thunkAPI, tinkoffInvestRestApi.getLastSecurities())
);
export const loadSecurityInfos = createAsyncThunk<SecurityInfo[]>(
  "securities/loadSecurityInfos",
  async (_, thunkAPI) =>
    await handleThunkError(thunkAPI, securitiesApi.getSecurityInfos())
);

export const securitiesSlice = createSlice({
  name: "securities",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setSecurityById: (
      state,
      { payload }: PayloadAction<number | undefined>
    ) => {
      if (payload && state.securities.length > 0) {
        state.security = state.securities.find(({ id }) => id === payload);
      } else {
        state.security = undefined;
      }
    },
    setSecurities: (state, { payload }: PayloadAction<SecurityLastInfo[]>) => {
      state.securities = payload;
      const { security } = state;
      if (security) {
        state.security = state.securities.find(({ id }) => id === security.id);
      }
    },
    selectSecurityTypeWrapper: (
      state,
      { payload }: PayloadAction<SecurityTypeWrapper>
    ) => {
      state.selectedSecurityTypeWrapper = payload;
    },
    selectBrokerId: (state, { payload }: PayloadAction<BrokerId>) => {
      state.selectedBrokerId = payload;
      state.selectedTradingPlatform =
        payload === BrokerId.ALFA_DIRECT
          ? TradingPlatform.QUIK
          : TradingPlatform.API;
    },
    selectTradingPlatform: (
      state,
      { payload }: PayloadAction<TradingPlatform>
    ) => {
      state.selectedTradingPlatform = payload;
    },
    setSessions: (
      state,
      { payload }: PayloadAction<DayAndEvening[]>
    ) => {
      state.sessions = payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  extraReducers: {
    // fetch securities
    [loadLastSecurities.pending as any]: (state: SecuritiesState) => {
      state.securities = [];
      state.securitiesLoading = LoadingState.LOADING;
    },
    [loadLastSecurities.fulfilled as any]: (
      state: SecuritiesState,
      action: PayloadAction<SecurityLastInfo[]>
    ) => {
      state.securities = action.payload;
      state.securitiesLoading = LoadingState.LOADED;
    },
    [loadLastSecurities.rejected as any]: (
      state: SecuritiesState,
      action: PayloadAction<any>
    ) => {
      state.securitiesLoadingError = action.payload;
      state.securitiesLoading = LoadingState.ERROR;
    },
    // load shares
    [loadShares.fulfilled as any]: (
      state: SecuritiesState,
      action: PayloadAction<SecurityShare[]>
    ) => {
      state.shares = action.payload;
      action.payload.forEach((sec) => SEC_MAP.set(sec.id, sec));
    },
    // load futures
    [loadFutures.fulfilled as any]: (
      state: SecuritiesState,
      action: PayloadAction<SecurityFuture[]>
    ) => {
      state.futures = action.payload;
      action.payload.forEach((sec) => SEC_MAP.set(sec.id, sec));
    },
    // load currencies
    [loadCurrencies.fulfilled as any]: (
      state: SecuritiesState,
      action: PayloadAction<SecurityCurrency[]>
    ) => {
      state.currencies = action.payload;
      action.payload.forEach((sec) => SEC_MAP.set(sec.id, sec));
    },
    // tinkoff
    [loadLastSecuritiesTinkoff.fulfilled as any]: (
      state: SecuritiesState,
      action: PayloadAction<SecurityLastInfo[]>
    ) => {
      state.securities = action.payload;
      state.securitiesLoading = LoadingState.LOADED;
    },
    [loadSecurityInfos.fulfilled as any]: (
      state: SecuritiesState,
      action: PayloadAction<SecurityInfo[]>
    ) => {
      action.payload.forEach(sec => state.securityInfoMap.set(sec.id, sec));
    },
  },
});

export const {
  setSecurityById,
  setSecurities,
  selectSecurityTypeWrapper,
  selectBrokerId,
  selectTradingPlatform,
  setSessions
} = securitiesSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectSecurities = createSelector(
  (state: RootState) => ({
    selectedSecurityTypeWrapper: state.securities.selectedSecurityTypeWrapper,
    selectedBrokerId: state.securities.selectedBrokerId,
    selectedTradingPlatform: state.securities.selectedTradingPlatform,
    security: state.securities.security,
    securities: state.securities.securities,
    shares: state.securities.shares,
    currencies: state.securities.currencies,
    futures: state.securities.futures,
    sessions: state.securities.sessions,
    securityInfoMap: state.securities.securityInfoMap,
  }),
  (state) => state
);

export default securitiesSlice.reducer;
