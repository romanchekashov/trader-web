import {LOAD_FILTER_DATA_SUCCESS, TradeStrategyBotControlActionTypes} from "./BotControlActions";
import { initialState } from "./BotControlSlice";

export default function BotControlReducer(state = initialState, action: TradeStrategyBotControlActionTypes) {
    switch (action.type) {
        case LOAD_FILTER_DATA_SUCCESS:
            return {...state, filter: action.filter};
        default:
            return state;
    }
}
