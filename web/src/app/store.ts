import {
  Action,
  configureStore,
  getDefaultMiddleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import { enableMapSet } from "immer";
import analysisReducer from "../features/analysis/AnalysisSlice";
import botControlReducer from "../features/bot-control/BotControlSlice";
import newsReducer from "../features/news/NewsSlice";
import tradeJournalReducer from "../features/trade-journal/TradeJournalSlice";
import activeTradesReducer from "./activeTrades/activeTradesSlice";
import depositsReducer from "./deposits/depositsSlice";
import notificationsReducer from "./notifications/notificationsSlice";
import ordersReducer from "./orders/ordersSlice";
import possibleTradesReducer from "./possibleTrades/possibleTradesSlice";
import securitiesReducer from "./securities/securitiesSlice";
import stopsReducer from "./stops/stopsSlice";

// https://github.com/reduxjs/redux-toolkit/issues/466
enableMapSet();
/**
 * redux-toolkit + typescript example
 * https://github.com/reduxjs/cra-template-redux-typescript/tree/master/template/src
 */
const store = configureStore({
  reducer: {
    news: newsReducer,
    analysis: analysisReducer,
    tradeJournal: tradeJournalReducer,
    botControl: botControlReducer,
    securities: securitiesReducer,
    possibleTrades: possibleTradesReducer,
    stops: stopsReducer,
    orders: ordersReducer,
    deposits: depositsReducer,
    activeTrades: activeTradesReducer,
    notifications: notificationsReducer,
  },
  middleware: getDefaultMiddleware({
    // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
    serializableCheck: {
      // Ignore these action types
      ignoredActions: [
        "news/fetch/fulfilled",
        "securities/loadLastSecurities/fulfilled",
        "securities/setSecurityById",
        "securities/loadShares/fulfilled",
        "securities/loadFutures/fulfilled",
        "securities/loadCurrencies/fulfilled",
        "securities/setSecurities",
        "possibleTrades/setPossibleTrade",
        "possibleTrades/loadPossibleTradesStat/fulfilled",
        "activeTrades/loadActiveTrades/fulfilled",
        "analysis/loadFilterData/fulfilled",
        "activeTrades/setActiveTrades",
        "stops/setStops",
        "stops/createStop/fulfilled",
        "stops/createStop/pending",
        "stops/createStop/rejected",
        "stops/deleteStopOrdersBySecId/fulfilled",
        "stops/deleteStopOrdersBySecId/pending",
        "possibleTrades/tradePossibleTrade/pending",
        "possibleTrades/tradePossibleTrade/rejected",
        "activeTrades/deleteActiveTrades/fulfilled",
        "activeTrades/deleteActiveTrades/pending",
        "activeTrades/setSelectedActiveTrade",
        "activeTrades/deleteActiveTrades/rejected",
        "news/fetch/pending",
        "deposits/loadFuturesClientLimits/fulfilled",
        "deposits/loadFuturesClientLimits/pending",
        "orders/setOrders",
        "deposits/setDeposits",
        "securities/loadLastSecurities/pending",
        "notifications/loadNotifications/fulfilled",
        "notifications/loadNotifications/pending",
        "notifications/loadSignals/fulfilled",
        "notifications/loadSignals/pending",
        "notifications/loadSignals/rejected",
        "notifications.newSignals",
        "securities/loadFutures/pending",
        "securities/loadCurrencies/pending",
        "securities/loadFutures/rejected",
        "securities/loadShares/rejected",
        "activeTrades/loadActiveTrades/pending",
        "possibleTrades/loadPossibleTradesStat/pending",
        "analysis/loadFilterData/pending",
        "securities/loadShares/pending",
        "notifications/addNewSignals",
        "securities/loadLastSecurities/rejected",
      ],
      // Ignore these field paths in all actions
      ignoredActionPaths: ["timestamp"],
    },
  }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
