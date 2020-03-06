import {LOAD_FILTER_DATA_SUCCESS} from "./tradeStrategyBotControlActions";
import {initialState} from "../../app/rootReducer";

export default function tradeStrategyBotControlReducer(state = initialState.filterData, action: any) {
    switch (action.type) {
        case LOAD_FILTER_DATA_SUCCESS:
            return action.filterData;
        default:
            return state;
    }
}
