import {combineReducers} from "redux";
import tradeStrategyBotControl from "../features/tradestrategybotcontrol/tradeStrategyBotControlReducer";
import {MarketBotFilterDataDto} from "../features/tradestrategybotcontrol/dto/MarketBotFilterDataDto";

export interface RootState {
    tradeStrategyBotControl: MarketBotFilterDataDto;
}

export const initialState: RootState = {
    tradeStrategyBotControl: null
};

const rootReducer = combineReducers({
    // analysisReducer,
    tradeStrategyBotControl
});

export default rootReducer;