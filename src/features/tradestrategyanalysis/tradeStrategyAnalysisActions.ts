import {AppDispatch} from "../../app/store";
import {MarketBotFilterDataDto} from "../tradestrategybotcontrol/dto/MarketBotFilterDataDto";
import {SecurityShare} from "../../api/dto/SecurityShare";
import {getSecurityShares} from "../../api/baseApi";
import {getFilterData} from "../../api/tradeStrategyBotControlApi";
import moment = require("moment");

export const LOAD_FILTER_DATA_SUCCESS = "LOAD_FILTER_DATA_SUCCESS";
export const LOAD_SECURITY_SHARES = "LOAD_SECURITY_SHARES";

interface LoadFilterSuccessAction {
    type: typeof LOAD_FILTER_DATA_SUCCESS
    filter: MarketBotFilterDataDto
}
interface LoadSecuritySharesAction {
    type: typeof LOAD_SECURITY_SHARES
    shares: SecurityShare[]
}

export interface TradeStrategyAnalysisState {
    filter: MarketBotFilterDataDto
    shares: SecurityShare[]
}

export type TradeStrategyAnalysisActionTypes = LoadFilterSuccessAction | LoadSecuritySharesAction

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

export const loadSecuritySharesSuccess = (shares: SecurityShare[]): LoadSecuritySharesAction => ({type: LOAD_SECURITY_SHARES, shares});

export const loadSecurityShares = () => (dispatch: AppDispatch) => {
    getSecurityShares()
        .then(shares => {
            shares.forEach(share => share.lastTradeTime = moment(share.lastTradeTime).format("HH:mm:ss DD-MM-YY"));
            dispatch(loadSecuritySharesSuccess(shares));
        })
        .catch(error => {
            throw error;
        });
};