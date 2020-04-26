import {combineReducers} from "redux";
import tradeStrategyBotControl from "../features/bot-control/tradeStrategyBotControlReducer";
import tradeStrategyAnalysis from "../features/tradestrategyanalysis/tradeStrategyAnalysisReducer";
import {TradeStrategyAnalysisState} from "../features/tradestrategyanalysis/tradeStrategyAnalysisActions";
import {TradeStrategyBotControlState} from "../features/bot-control/tradeStrategyBotControlActions";
import {TradeJournalState} from "../features/trade-journal/tradeJournalActions";
import tradeJournal from "../features/trade-journal/tradeJournalReducer";


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