import {AppDispatch} from "../../app/store";
import {MarketBotFilterDataDto} from "../../api/dto/MarketBotFilterDataDto";
import {SecurityShare} from "../../api/dto/SecurityShare";
import {getSecurityShares} from "../../api/baseApi";
import {getFilterData} from "../../api/tradeStrategyBotControlApi";
import moment = require("moment");
import {TradePremise} from "../../api/tradestrategyanalysis/dto/TradePremise";
import {getTradePremise} from "../../api/tradestrategyanalysis/tradeStrategyAnalysisApi";
import {TradeStrategyAnalysisFilterDto} from "../../api/tradestrategyanalysis/dto/TradeStrategyAnalysisFilterDto";

export const LOAD_FILTER_DATA_SUCCESS = "LOAD_FILTER_DATA_SUCCESS";
export const LOAD_SECURITY_SHARES = "LOAD_SECURITY_SHARES";
export const LOAD_TRADE_PREMISE_SUCCESS = "LOAD_TRADE_PREMISE_SUCCESS";

interface LoadFilterSuccessAction {
    type: typeof LOAD_FILTER_DATA_SUCCESS
    filter: MarketBotFilterDataDto
}
interface LoadSecuritySharesAction {
    type: typeof LOAD_SECURITY_SHARES
    shares: SecurityShare[]
}
interface LoadTradePremiseSuccessAction {
    type: typeof LOAD_TRADE_PREMISE_SUCCESS
    premise: TradePremise
}

export interface TradeStrategyAnalysisState {
    filter: MarketBotFilterDataDto
    shares: SecurityShare[]
    premise: TradePremise
}

export type TradeStrategyAnalysisActionTypes = LoadFilterSuccessAction | LoadSecuritySharesAction | LoadTradePremiseSuccessAction

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

export const loadTradePremiseSuccess = (premise: TradePremise): LoadTradePremiseSuccessAction => ({type: LOAD_TRADE_PREMISE_SUCCESS, premise});

export const loadTradePremise = (filter: TradeStrategyAnalysisFilterDto) => (dispatch: AppDispatch) => {
    getTradePremise(filter)
        .then(premise => {
            dispatch(loadTradePremiseSuccess(premise));
        })
        .catch(error => {
            throw error;
        });
};