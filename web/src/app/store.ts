import {
  Action,
  configureStore,
  getDefaultMiddleware,
  ThunkAction,
} from "@reduxjs/toolkit";
import analysisReducer from "../features/analysis/AnalysisSlice";
import botControlReducer from "../features/bot-control/BotControlSlice";
import newsReducer from "../features/news/NewsSlice";
import tradeJournalReducer from "../features/trade-journal/TradeJournalSlice";
import possibleTradesReducer from "./possibleTrades/possibleTradesSlice";
import securitiesReducer from "./securities/securitiesSlice";
import stopsReducer from "./stops/stopsSlice";
import depositsReducer from "./deposits/depositsSlice";
import activeTradesReducer from "./activeTrades/activeTradesSlice";

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
    deposits: depositsReducer,
    activeTrades: activeTradesReducer,
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
        "possibleTrades/tradePossibleTrade/pending",
        "possibleTrades/tradePossibleTrade/rejected",
        "activeTrades/deleteActiveTrades/fulfilled",
        "activeTrades/deleteActiveTrades/pending",
        "activeTrades/setSelectedActiveTrade",
        "activeTrades/deleteActiveTrades/rejected",
        "news/fetch/pending",
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
