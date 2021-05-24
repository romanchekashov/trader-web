import securitiesApi from "../../app/securities/securitiesApi";
import { AppDispatch } from "../../app/store";
import { getTradePremise } from "../../common/api/rest/analysisRestApi";
import { getFilterData } from "../../common/api/rest/botControlRestApi";
import { MarketBotFilterDataDto } from "../../common/data/bot/MarketBotFilterDataDto";
import { SecurityCurrency } from "../../common/data/security/SecurityCurrency";
import { SecurityFuture } from "../../common/data/security/SecurityFuture";
import { SecurityShare } from "../../common/data/security/SecurityShare";
import { TradePremise } from "../../common/data/strategy/TradePremise";
import { TradeStrategyAnalysisFilterDto } from "../../common/data/TradeStrategyAnalysisFilterDto";
import { adjustTradePremise } from "../../common/utils/DataUtils";

export const LOAD_FILTER_DATA_SUCCESS = "LOAD_FILTER_DATA_SUCCESS";
export const LOAD_SECURITY_SHARES = "LOAD_SECURITY_SHARES";
export const LOAD_TRADE_PREMISE_SUCCESS = "LOAD_TRADE_PREMISE_SUCCESS";
export const LOAD_TRADE_PREMISE_FAIL = "LOAD_TRADE_PREMISE_FAIL";
export const LOAD_SECURITY_CURRENCY_SUCCESS = "LOAD_SECURITY_CURRENCY_SUCCESS";
export const LOAD_SECURITY_FUTURE_SUCCESS = "LOAD_SECURITY_FUTURE_SUCCESS";

interface LoadFilterSuccessAction {
  type: typeof LOAD_FILTER_DATA_SUCCESS;
  filter: MarketBotFilterDataDto;
}

interface LoadSecuritySharesAction {
  type: typeof LOAD_SECURITY_SHARES;
  shares: SecurityShare[];
}

interface LoadTradePremiseSuccessAction {
  type: typeof LOAD_TRADE_PREMISE_SUCCESS;
  premise: TradePremise;
}

interface LoadTradePremiseFailAction {
  type: typeof LOAD_TRADE_PREMISE_FAIL;
  premise: TradePremise;
}

interface LoadSecurityCurrencySuccessAction {
  type: typeof LOAD_SECURITY_CURRENCY_SUCCESS;
  currencies: SecurityCurrency[];
}

interface LoadSecurityFutureSuccessAction {
  type: typeof LOAD_SECURITY_FUTURE_SUCCESS;
  futures: SecurityFuture[];
}

export interface TradeStrategyAnalysisState {
  filter: MarketBotFilterDataDto;
  shares: SecurityShare[];
  currencies: SecurityCurrency[];
  futures: SecurityFuture[];
  premise: TradePremise;
}

export type TradeStrategyAnalysisActionTypes =
  | LoadFilterSuccessAction
  | LoadSecuritySharesAction
  | LoadTradePremiseSuccessAction
  | LoadSecurityCurrencySuccessAction
  | LoadSecurityFutureSuccessAction;

export const loadFilterDataSuccess = (
  filter: MarketBotFilterDataDto
): LoadFilterSuccessAction => ({
  type: LOAD_FILTER_DATA_SUCCESS,
  filter,
});
export const loadFilterData = () => (dispatch: AppDispatch) => {
  getFilterData(false)
    .then((filter) => {
      dispatch(loadFilterDataSuccess(filter));
    })
    .catch((error) => {
      throw error;
    });
};

export const loadSecuritySharesSuccess = (
  shares: SecurityShare[]
): LoadSecuritySharesAction => ({
  type: LOAD_SECURITY_SHARES,
  shares,
});
export const loadSecurityShares = () => (dispatch: AppDispatch) => {
  securitiesApi
    .getAllSecurityShares()
    .then((shares) => {
      if (shares.length > 0) {
        if (shares[0].valueToday !== null) {
          shares = shares
            .filter((value) => value.valueToday > 0)
            .sort((a, b) => b.valueToday - a.valueToday);
          // shares.forEach(share => share.lastTradeTime = moment(share.lastTradeTime).format("HH:mm:ss DD-MM-YY"));
        } else {
          shares = shares.sort((a, b) => {
            if (a.secCode < b.secCode) {
              return -1;
            }
            if (a.secCode > b.secCode) {
              return 1;
            }
            return 0;
          });
        }
      }
      dispatch(loadSecuritySharesSuccess(shares));
    })
    .catch((error) => {
      throw error;
    });
};

export const loadTradePremiseSuccess = (
  premise: TradePremise
): LoadTradePremiseSuccessAction => ({
  type: LOAD_TRADE_PREMISE_SUCCESS,
  premise,
});
export const loadTradePremiseFail = (
  premise: TradePremise
): LoadTradePremiseFailAction => ({
  type: LOAD_TRADE_PREMISE_FAIL,
  premise,
});
let loadTradePremiseAttempts = 3;
export const loadTradePremise =
  (filter: TradeStrategyAnalysisFilterDto) => (dispatch: AppDispatch) => {
    getTradePremise(filter)
      .then((premise) => {
        loadTradePremiseAttempts = 3;
        adjustTradePremise(premise);
        dispatch(loadTradePremiseSuccess(premise));
      })
      .catch((error) => {
        if (loadTradePremiseAttempts-- > 0) {
          loadTradePremise(filter);
        } else {
          loadTradePremiseAttempts = 3;
        }
        throw error;
      });
  };

export const loadSecurityCurrencySuccess = (
  currencies: SecurityCurrency[]
): LoadSecurityCurrencySuccessAction => ({
  type: LOAD_SECURITY_CURRENCY_SUCCESS,
  currencies,
});
export const loadSecurityCurrency = () => (dispatch: AppDispatch) => {
  securitiesApi
    .getAllSecurityCurrencies()
    .then((currencies) => {
      dispatch(
        loadSecurityCurrencySuccess(
          currencies.sort((a, b) => b.valueToday - a.valueToday)
        )
      );
    })
    .catch((error) => {
      throw error;
    });
};

export const loadSecurityFutureSuccess = (
  futures: SecurityFuture[]
): LoadSecurityFutureSuccessAction => ({
  type: LOAD_SECURITY_FUTURE_SUCCESS,
  futures,
});
export const loadSecurityFuture = () => (dispatch: AppDispatch) => {
  securitiesApi
    .getAllSecurityFutures()
    .then((futures) => {
      dispatch(
        loadSecurityFutureSuccess(
          futures.sort((a, b) => b.valueToday - a.valueToday)
        )
      );
    })
    .catch((error) => {
      throw error;
    });
};
