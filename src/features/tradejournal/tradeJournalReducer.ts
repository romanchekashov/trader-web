import {initialState} from "../../app/rootReducer";
import {LOAD_STAT_SUCCESS, TradeJournalActionTypes} from "./tradeJournalActions";

export default function tradeJournalReducer(state = initialState.tradeJournal, action: TradeJournalActionTypes) {
    switch (action.type) {
        case LOAD_STAT_SUCCESS:
            return {...state, stat: action.stat};
        default:
            return state;
    }
}
