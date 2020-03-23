import {
    LOAD_FILTER_DATA_SUCCESS,
    LOAD_SECURITY_CURRENCY_SUCCESS,
    LOAD_SECURITY_FUTURE_SUCCESS,
    LOAD_SECURITY_SHARES,
    LOAD_TRADE_PREMISE_SUCCESS,
    TradeStrategyAnalysisActionTypes
} from "./tradeStrategyAnalysisActions";
import {initialState} from "../../app/rootReducer";

export default function tradeStrategyAnalysisReducer(state = initialState.tradeStrategyAnalysis, action: TradeStrategyAnalysisActionTypes) {
    switch (action.type) {
        case LOAD_FILTER_DATA_SUCCESS:
            return {...state, filter: action.filter};
        case LOAD_SECURITY_SHARES:
            return {...state, shares: action.shares};
        case LOAD_TRADE_PREMISE_SUCCESS:
            return {...state, premise: action.premise};
        case LOAD_SECURITY_CURRENCY_SUCCESS:
            return {...state, currencies: action.currencies};
        case LOAD_SECURITY_FUTURE_SUCCESS:
            return {...state, futures: action.futures};
        default:
            return state;
    }
}
