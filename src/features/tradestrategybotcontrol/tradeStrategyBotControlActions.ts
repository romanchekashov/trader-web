import {MarketBotFilterDataDto} from "./dto/MarketBotFilterDataDto";
import {getFilterData} from "../../api/tradeStrategyBotControlApi";
import {AppDispatch} from "../../app/store";
import {AnyAction} from "redux";

export const LOAD_FILTER_DATA_SUCCESS = "LOAD_FILTER_DATA_SUCCESS";

export const loadFilterDataSuccess = (filterData: MarketBotFilterDataDto): AnyAction => ({type: LOAD_FILTER_DATA_SUCCESS, filterData});

export const loadFilterData = () => (dispatch: AppDispatch) => {
    getFilterData()
        .then(data => {
            dispatch(loadFilterDataSuccess(data));
        })
        .catch(error => {
            throw error;
        });
};