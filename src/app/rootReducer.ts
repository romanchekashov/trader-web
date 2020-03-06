import {combineReducers} from "redux";
import tradeStrategyBotControlReducer from "../features/tradestrategybotcontrol/tradeStrategyBotControlReducer";
import {MarketBotFilterDataDto} from "../features/tradestrategybotcontrol/dto/MarketBotFilterDataDto";

export interface RootState {
    filterData: MarketBotFilterDataDto;
}

export const initialState: RootState = {
    filterData: null
};

const rootReducer = combineReducers({
    // analysisReducer,
    tradeStrategyBotControlReducer
});

export default rootReducer;