import {LOAD_STAT_SUCCESS, TradeJournalActionTypes} from "./TradeJournalActions";
import { initialState } from "./TradeJournalSlice";

export default function TradeJournalReducer(state = initialState, action: TradeJournalActionTypes) {
    switch (action.type) {
        case LOAD_STAT_SUCCESS:
            return {...state, stat: action.stat};
        default:
            return state;
    }
}
