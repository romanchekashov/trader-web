import {
  configureStore,
  getDefaultMiddleware,
  ThunkAction,
  Action,
} from "@reduxjs/toolkit";
import newsReducer from "../features/news/NewsSlice";
import securitiesReducer from "./securities/securitiesSlice";
import analysisReducer from "../features/analysis/AnalysisSlice";
import tradeJournalReducer from "../features/trade-journal/TradeJournalSlice";
import botControlReducer from "../features/bot-control/BotControlSlice";

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
  },
  middleware: getDefaultMiddleware({
    // https://redux-toolkit.js.org/usage/usage-guide#working-with-non-serializable-data
    serializableCheck: {
      // Ignore these action types
      ignoredActions: ["news/fetch/fulfilled"],
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
