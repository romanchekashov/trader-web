import {combineReducers} from "redux";
import tradeStrategyBotControl from "../features/tradestrategybotcontrol/tradeStrategyBotControlReducer";
import tradeStrategyAnalysis from "../features/tradestrategyanalysis/tradeStrategyAnalysisReducer";
import {TradeStrategyAnalysisState} from "../features/tradestrategyanalysis/tradeStrategyAnalysisActions";
import {TradeStrategyBotControlState} from "../features/tradestrategybotcontrol/tradeStrategyBotControlActions";


interface AsRootState {
    tradeStrategyAnalysis: TradeStrategyAnalysisState
    tradeStrategyBotControl: TradeStrategyBotControlState
}
export const initialState: AsRootState = {
    tradeStrategyBotControl: {
        filter: null
    },
    tradeStrategyAnalysis: {
        filter: null,
        shares: [],
        premise: null
    }
};

const rootReducer = combineReducers({
    tradeStrategyAnalysis,
    tradeStrategyBotControl
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;