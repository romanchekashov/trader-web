import {LOAD_FILTER_DATA_SUCCESS, TradeStrategyBotControlActionTypes} from "./tradeStrategyBotControlActions";
import {initialState} from "../../app/rootReducer";

export default function tradeStrategyBotControlReducer(state = initialState.filter, action: TradeStrategyBotControlActionTypes) {
    switch (action.type) {
        case LOAD_FILTER_DATA_SUCCESS:
            return action.filter;
        default:
            return state;
    }
}
