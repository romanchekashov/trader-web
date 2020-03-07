import {MarketBotFilterDataDto} from "./dto/MarketBotFilterDataDto";
import {getFilterData} from "../../api/tradeStrategyBotControlApi";
import {AppDispatch} from "../../app/store";

export const LOAD_FILTER_DATA_SUCCESS = "LOAD_FILTER_DATA_SUCCESS";

interface LoadFilterSuccessAction {
    type: typeof LOAD_FILTER_DATA_SUCCESS
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