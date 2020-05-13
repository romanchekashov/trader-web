import {combineReducers} from "redux";
import tradeStrategyBotControl from "../features/bot-control/BotControlReducer";
import tradeStrategyAnalysis from "../features/tradestrategyanalysis/AnalysisReducer";
import {TradeStrategyAnalysisState} from "../features/tradestrategyanalysis/AnalysisActions";
import {TradeStrategyBotControlState} from "../features/bot-control/BotControlActions";
import {TradeJournalState} from "../features/trade-journal/TradeJournalActions";
import tradeJournal from "../features/trade-journal/TradeJournalReducer";


interface AsRootState {
    tradeStrategyAnalysis: TradeStrategyAnalysisState
    tradeStrategyBotControl: TradeStrategyBotControlState
    tradeJournal: TradeJournalState
}
export const initialState: AsRootState = {
    tradeStrategyBotControl: {
        filter: null
    },
    tradeStrategyAnalysis: {
        filter: null,
        shares: [],
        currencies: [],
        futures: [],
        premise: null
    },
    tradeJournal: {
        stat: []
    }
};

const rootReducer = combineReducers({
    tradeStrategyAnalysis,
    tradeStrategyBotControl,
    tradeJournal
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;