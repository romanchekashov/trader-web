import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { Order } from "../../common/data/Order";
import { LoadingState } from "../LoadingState";
import { handleThunkError } from "../reduxUtils";
import { RootState } from "../store";
import quikOrdersApi from "./quikOrdersApi";

export interface OrdersState {
  orders: Order[];
  ordersLoading: LoadingState;
  ordersLoadingError?: string;

  created?: Order;
  createdLoading: LoadingState;
  createdLoadingError?: string;

  deleted?: Order;
  deletedLoading: LoadingState;
  deletedLoadingError?: string;
}

export const initialState: OrdersState = {
  orders: [],
  ordersLoading: LoadingState.IDLE,
  createdLoading: LoadingState.IDLE,
  deletedLoading: LoadingState.IDLE,
};

export const loadOrders = createAsyncThunk<Order[]>(
  "orders/loadOrders",
  async (_, thunkAPI) =>
    await handleThunkError(thunkAPI, quikOrdersApi.getOrders())
);

export const createOrder = createAsyncThunk<Order, Order>(
  "orders/createOrder",
  async (order, thunkAPI) =>
    await handleThunkError(thunkAPI, quikOrdersApi.createOrder(order))
);

export const deleteOrder = createAsyncThunk<Order, string>(
  "orders/deleteOrder",
  async (orderNum, thunkAPI) =>
    await handleThunkError(thunkAPI, quikOrdersApi.deleteOrder(orderNum))
);

export const deleteOrdersBySecId = createAsyncThunk<Order[], number>(
  "orders/deleteOrdersBySecId",
  async (secId, thunkAPI) =>
    await handleThunkError(thunkAPI, quikOrdersApi.deleteOrdersBySecId(secId))
);

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setOrders: (state, { payload }: PayloadAction<Order[]>) => {
      state.orders = payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere, including actions generated by createAsyncThunk or in other slices.
  extraReducers: {
    [loadOrders.pending as any]: (state: OrdersState) => {
      state.orders = [];
      state.ordersLoading = LoadingState.LOADING;
    },
    [loadOrders.fulfilled as any]: (
      state: OrdersState,
      action: PayloadAction<Order[]>
    ) => {
      state.orders = action.payload;
      state.ordersLoading = LoadingState.LOADED;
    },
    [loadOrders.rejected as any]: (
      state: OrdersState,
      action: PayloadAction<any>
    ) => {
      state.ordersLoadingError = action.payload;
      state.ordersLoading = LoadingState.ERROR;
    },
    // createOrder
    [createOrder.pending as any]: (state: OrdersState) => {
      state.created = undefined;
      state.createdLoading = LoadingState.LOADING;
    },
    [createOrder.fulfilled as any]: (
      state: OrdersState,
      action: PayloadAction<Order>
    ) => {
      state.created = action.payload;
      state.createdLoading = LoadingState.LOADED;
    },
    [createOrder.rejected as any]: (
      state: OrdersState,
      action: PayloadAction<any>
    ) => {
      state.createdLoadingError = action.payload;
      state.createdLoading = LoadingState.ERROR;
    },
    // deleteOrder
    [deleteOrder.pending as any]: (state: OrdersState) => {
      state.deleted = undefined;
      state.deletedLoading = LoadingState.LOADING;
    },
    [deleteOrder.fulfilled as any]: (
      state: OrdersState,
      action: PayloadAction<Order>
    ) => {
      state.deleted = action.payload;
      state.deletedLoading = LoadingState.LOADED;
      state.orders = state.orders.filter(
        ({ orderNum }) => orderNum !== action.payload.orderNum
      );
    },
    [deleteOrder.rejected as any]: (
      state: OrdersState,
      action: PayloadAction<any>
    ) => {
      state.deletedLoadingError = action.payload;
      state.deletedLoading = LoadingState.ERROR;
    },

    // delete all by sec id
    [deleteOrdersBySecId.fulfilled as any]: (
      state: OrdersState,
      action: PayloadAction<Order[]>
    ) => {
      state.orders = state.orders.filter(
        ({ orderNum }) =>
          !action.payload.find((stop) => stop.orderNum === orderNum)
      );
    },
  },
});

export const { setOrders } = ordersSlice.actions;

export const selectOrders = createSelector(
  (state: RootState) => ({
    orders: state.orders.orders,
    ordersLoading: state.orders.ordersLoading,
    ordersLoadingError: state.orders.ordersLoadingError,
  }),
  (state) => state
);

export default ordersSlice.reducer;
