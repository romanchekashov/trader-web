import {
    LOAD_FILTER_DATA_SUCCESS,
    LOAD_SECURITY_SHARES,
    TradeStrategyAnalysisActionTypes
} from "./tradeStrategyAnalysisActions";
import {initialState} from "../../app/rootReducer";

export default function tradeStrategyAnalysisReducer(state = initialState.tradeStrategyAnalysis, action: TradeStrategyAnalysisActionTypes) {
    switch (action.type) {
        case LOAD_FILTER_DATA_SUCCESS:
            return {...state, filter: action.filter};
        case LOAD_SECURITY_SHARES:
            return {...state, shares: action.shares};
        default:
            return state;
    }
}
