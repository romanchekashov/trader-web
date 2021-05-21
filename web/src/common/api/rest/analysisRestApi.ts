import { PatternResult } from "../../components/alerts/data/PatternResult";
import { MarketStateDto } from "../../components/market-state/data/MarketStateDto";
import { MarketStateFilterDto } from "../../components/market-state/data/MarketStateFilterDto";
import { SwingStateDto } from "../../components/swing-state/data/SwingStateDto";
import { ClassCode } from "../../data/ClassCode";
import { FilterDto } from "../../data/FilterDto";
import { Interval } from "../../data/Interval";
import { SecurityShareEvent } from "../../data/news/SecurityShareEvent";
import { MoexOpenInterest } from "../../data/open-interest/MoexOpenInterest";
import { SecurityAnalysis } from "../../data/security/SecurityAnalysis";
import { SecurityLastInfo } from "../../data/security/SecurityLastInfo";
import { TradePremise } from "../../data/strategy/TradePremise";
import { Trend } from "../../data/strategy/Trend";
import { TradeStrategyAnalysisFilterDto } from "../../data/TradeStrategyAnalysisFilterDto";
import {
  adjustMarketState,
  adjustMoexOpenInterestList,
  adjustSecurities,
  adjustSecurityShareEvents,
  adjustSwingStateDto,
  adjustTradePremise,
} from "../../utils/DataUtils";
import { handleError, handleResponse } from "../apiUtils";

const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-analysis/";

export default {
  getTradePremise,
  getTrend,
  getCandlePatterns,
  getMarketState,
  getSwingStates,
  getMoexOpenInterests,
  getMoexApiOpenInterestList,
  getSecurityShareEvents,
  getSecurities,
  getLastSecurities,
};

export function getTradePremise(
  filter: TradeStrategyAnalysisFilterDto
): Promise<TradePremise> {
  return fetch(baseUrl + "premise", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(filter),
  })
    .then((response) =>
      handleResponse(response).then((premise) => {
        adjustTradePremise(premise);
        return premise;
      })
    )
    .catch(handleError);
}

export function getTrend(
  classCode: ClassCode,
  securityCode: string,
  interval: Interval,
  numberOfCandles: number
): Promise<Trend> {
  return fetch(
    `${baseUrl}trend?classCode=${classCode}&securityCode=${securityCode}&interval=${interval}&numberOfCandles=${numberOfCandles}`
  )
    .then(handleResponse)
    .catch(handleError);
}

function getCandlePatterns(filter: FilterDto): Promise<PatternResult[]> {
  return fetch(baseUrl + "candle-patterns", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(filter),
  })
    .then((response) =>
      handleResponse(response).then((patternResults) => {
        if (patternResults && patternResults.length > 0) {
          for (const result of patternResults) {
            result.candle.timestamp = new Date(result.candle.timestamp);
          }
        }
        return patternResults;
      })
    )
    .catch(handleError);
}

export function getMarketState(
  filter: MarketStateFilterDto
): Promise<MarketStateDto> {
  return fetch(baseUrl + "market-state", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(filter),
  })
    .then((response) => handleResponse(response).then(adjustMarketState))
    .catch(handleError);
}

export function getSwingStates(
  filter: MarketStateFilterDto
): Promise<SwingStateDto[]> {
  return fetch(baseUrl + "swing-states", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(filter),
  })
    .then((response) =>
      handleResponse(response).then((states) => {
        for (const state of states) {
          adjustSwingStateDto(state);
        }
        return states;
      })
    )
    .catch(handleError);
}

export function getMoexOpenInterests(
  classCode: ClassCode,
  secCode: string,
  from?: string
): Promise<MoexOpenInterest[]> {
  let url = `${baseUrl}moex-open-interests?classCode=${classCode}&secCode=${secCode}`;
  if (from) {
    url = `${url}&from=${from}`;
  }
  return fetch(url)
    .then((response) =>
      handleResponse(response).then(adjustMoexOpenInterestList)
    )
    .catch(handleError);
}

export function getMoexApiOpenInterestList(
  classCode: ClassCode,
  secCode: string
): Promise<MoexOpenInterest[]> {
  return fetch(
    `${baseUrl}moex-api-open-interest-list?classCode=${classCode}&secCode=${secCode}`
  )
    .then((response) =>
      handleResponse(response).then(adjustMoexOpenInterestList)
    )
    .catch(handleError);
}

export function getSecurityShareEvents(
  secCode: string
): Promise<SecurityShareEvent[]> {
  return fetch(`${baseUrl}security-share-events?secCode=${secCode}`)
    .then((response) =>
      handleResponse(response).then(adjustSecurityShareEvents)
    )
    .catch(handleError);
}

export function getSecurities(): Promise<SecurityAnalysis[]> {
  return fetch(`${baseUrl}securities`)
    .then((response) => handleResponse(response).then(adjustSecurities))
    .catch(handleError);
}

export function getLastSecurities(secId?: number): Promise<SecurityLastInfo[]> {
  return fetch(`${baseUrl}last-securities` + (secId ? `?secId=${secId}` : ""))
    .then((response) => handleResponse(response).then(adjustSecurities))
    .catch(handleError);
}
