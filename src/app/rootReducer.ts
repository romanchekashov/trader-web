import {combineReducers} from "redux";
import tradeStrategyBotControl from "../features/tradestrategybotcontrol/tradeStrategyBotControlReducer";
import {MarketBotFilterDataDto} from "../features/tradestrategybotcontrol/dto/MarketBotFilterDataDto";


interface AsRootState {
    filter: MarketBotFilterDataDto
}
export const initialState: AsRootState = {
    filter: null
};

const rootReducer = combineReducers({
    // analysisReducer,
    filter: tradeStrategyBotControl
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;