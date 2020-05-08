import {MarketBotFilterDataDto} from "../../common/api/dto/MarketBotFilterDataDto";
import {getFilterData} from "../../common/api/bot-control/tradeStrategyBotControlApi";
import {AppDispatch} from "../../app/store";

export const LOAD_FILTER_DATA_SUCCESS = "LOAD_FILTER_DATA_SUCCESS";
export const START_BOT_SUCCESS = "START_BOT_SUCCESS";

interface LoadFilterSuccessAction {
    type: typeof LOAD_FILTER_DATA_SUCCESS
    filter: MarketBotFilterDataDto
}

export interface TradeStrategyBotControlState {
    filter: MarketBotFilterDataDto
}

export type TradeStrategyBotControlActionTypes = LoadFilterSuccessAction

export const loadFilterDataSuccess = (filter: MarketBotFilterDataDto): LoadFilterSuccessAction => ({type: LOAD_FILTER_DATA_SUCCESS, filter});

export const loadFilterData = () => (dispatch: AppDispatch) => {
    getFilterData()
        .then(filter => {
            dispatch(loadFilterDataSuccess(filter));
        })
        .catch(error => {
            throw error;
        });
};