import {LOAD_FILTER_DATA_SUCCESS, TradeStrategyBotControlActionTypes} from "./BotControlActions";
import {initialState} from "../../app/rootReducer";

export default function BotControlReducer(state = initialState.tradeStrategyBotControl, action: TradeStrategyBotControlActionTypes) {
    switch (action.type) {
        case LOAD_FILTER_DATA_SUCCESS:
            return {...state, filter: action.filter};
        default:
            return state;
    }
}
