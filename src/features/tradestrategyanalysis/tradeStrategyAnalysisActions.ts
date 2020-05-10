import {AppDispatch} from "../../app/store";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {SecurityShare} from "../../common/data/SecurityShare";
import {getSecurityCurrencies, getSecurityFutures, getSecurityShares} from "../../common/api/rest/traderRestApi";
import {getFilterData} from "../../common/api/rest/botControlRestApi";
import moment = require("moment");
import {TradePremise} from "../../common/data/strategy/TradePremise";
import {getTradePremise} from "../../common/api/rest/analysisRestApi";
import {TradeStrategyAnalysisFilterDto} from "../../common/data/TradeStrategyAnalysisFilterDto";
import {SecurityCurrency} from "../../common/data/SecurityCurrency";
import {SecurityFuture} from "../../common/data/SecurityFuture";

export const LOAD_FILTER_DATA_SUCCESS = "LOAD_FILTER_DATA_SUCCESS";
export const LOAD_SECURITY_SHARES = "LOAD_SECURITY_SHARES";
export const LOAD_TRADE_PREMISE_SUCCESS = "LOAD_TRADE_PREMISE_SUCCESS";
export const LOAD_TRADE_PREMISE_FAIL = "LOAD_TRADE_PREMISE_FAIL";
export const LOAD_SECURITY_CURRENCY_SUCCESS = "LOAD_SECURITY_CURRENCY_SUCCESS";
export const LOAD_SECURITY_FUTURE_SUCCESS = "LOAD_SECURITY_FUTURE_SUCCESS";

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
interface LoadTradePremiseFailAction {
    type: typeof LOAD_TRADE_PREMISE_FAIL
    premise: TradePremise
}
interface LoadSecurityCurrencySuccessAction {
    type: typeof LOAD_SECURITY_CURRENCY_SUCCESS
    currencies: SecurityCurrency[]
}
interface LoadSecurityFutureSuccessAction {
    type: typeof LOAD_SECURITY_FUTURE_SUCCESS
    futures: SecurityFuture[]
}

export interface TradeStrategyAnalysisState {
    filter: MarketBotFilterDataDto
    shares: SecurityShare[]
    currencies: SecurityCurrency[]
    futures: SecurityFuture[]
    premise: TradePremise
}

export type TradeStrategyAnalysisActionTypes = LoadFilterSuccessAction | LoadSecuritySharesAction | LoadTradePremiseSuccessAction
    | LoadSecurityCurrencySuccessAction | LoadSecurityFutureSuccessAction

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
            shares = shares
                .filter(value => value.todayMoneyTurnover > 0)
                .sort((a, b) => b.todayMoneyTurnover - a.todayMoneyTurnover);
            shares.forEach(share => share.lastTradeTime = moment(share.lastTradeTime).format("HH:mm:ss DD-MM-YY"));
            dispatch(loadSecuritySharesSuccess(shares));
        })
        .catch(error => {
            throw error;
        });
};

export const loadTradePremiseSuccess = (premise: TradePremise): LoadTradePremiseSuccessAction => ({type: LOAD_TRADE_PREMISE_SUCCESS, premise});
export const loadTradePremiseFail = (premise: TradePremise): LoadTradePremiseFailAction => ({type: LOAD_TRADE_PREMISE_FAIL, premise});
let loadTradePremiseAttempts = 3;
export const loadTradePremise = (filter: TradeStrategyAnalysisFilterDto) => (dispatch: AppDispatch) => {
    getTradePremise(filter)
        .then(premise => {
            loadTradePremiseAttempts = 3;
            if (premise && premise.analysis.srZones) {
                for (const srZone of premise.analysis.srZones) {
                    srZone.timestamp = new Date(srZone.timestamp)
                }
            }
            dispatch(loadTradePremiseSuccess(premise));
        })
        .catch(error => {
            if (loadTradePremiseAttempts-- > 0) {
                loadTradePremise(filter);
            } else {
                loadTradePremiseAttempts = 3;
            }
            throw error;
        });
};

export const loadSecurityCurrencySuccess = (currencies: SecurityCurrency[]): LoadSecurityCurrencySuccessAction => ({type: LOAD_SECURITY_CURRENCY_SUCCESS, currencies});
export const loadSecurityCurrency = () => (dispatch: AppDispatch) => {
    getSecurityCurrencies()
        .then(currencies => {
            dispatch(loadSecurityCurrencySuccess(currencies.sort((a, b) => b.todayMoneyTurnover - a.todayMoneyTurnover)));
        })
        .catch(error => {
            throw error;
        });
};

export const loadSecurityFutureSuccess = (futures: SecurityFuture[]): LoadSecurityFutureSuccessAction => ({type: LOAD_SECURITY_FUTURE_SUCCESS, futures});
export const loadSecurityFuture = () => (dispatch: AppDispatch) => {
    getSecurityFutures()
        .then(futures => {
            dispatch(loadSecurityFutureSuccess(futures.sort((a, b) => b.todayMoneyTurnover - a.todayMoneyTurnover)));
        })
        .catch(error => {
            throw error;
        });
};

function compareNumbers(a, b) {
    return a - b;
}