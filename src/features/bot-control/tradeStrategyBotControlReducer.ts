import {LOAD_FILTER_DATA_SUCCESS, TradeStrategyBotControlActionTypes} from "./tradeStrategyBotControlActions";
import {initialState} from "../../app/rootReducer";

export default function tradeStrategyBotControlReducer(state = initialState.tradeStrategyBotControl, action: TradeStrategyBotControlActionTypes) {
    switch (action.type) {
        case LOAD_FILTER_DATA_SUCCESS:
            return {...state, filter: action.filter};
        default:
            return state;
    }
}
