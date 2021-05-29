import { get, handleError, handleResponse } from "../../common/api/apiUtils";
import { MarketBotFilterDataDto } from "../../common/data/bot/MarketBotFilterDataDto";
import { MarketBotStartDto } from "../../common/data/bot/MarketBotStartDto";
import { TradingStrategyResult } from "../../common/data/history/TradingStrategyResult";
import {
  adjustTradingStrategyResult,
  adjustTradingStrategyResultArray,
} from "../../common/utils/DataUtils";
import { TradingStrategyStatus } from "../../common/data/trading/TradingStrategyStatus";
import { SecurityHistoryDatesDto } from "../../common/data/bot/SecurityHistoryDatesDto";
import { SecurityType } from "../../common/data/security/SecurityType";
import { Page } from "../../common/data/Page";

const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-bot-control/";

export function getFilterData(
  history: boolean
): Promise<MarketBotFilterDataDto> {
  return fetch(baseUrl + "filter-data?history=" + history)
    .then(handleResponse)
    .catch(handleError);
}

export function getSecurityHistoryDates(
  type: SecurityType,
  secCode: string
): Promise<SecurityHistoryDatesDto> {
  return fetch(
    `${baseUrl}security-history-dates?type=${type}&secCode=${secCode}`
  )
    .then(handleResponse)
    .catch(handleError);
}

export function startBot(dto: MarketBotStartDto): Promise<any> {
  return fetch(baseUrl + "start-bot", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
  })
    .then(handleResponse)
    .catch(handleError);
}

export function switchBotStatus(
  tradingStrategyId: number,
  tradingStrategyStatus: TradingStrategyStatus
): Promise<void> {
  return fetch(
    `${baseUrl}switch-bot-status?tradingStrategyId=${tradingStrategyId}&tradingStrategyStatus=${tradingStrategyStatus}`
  )
    .then(handleResponse)
    .catch(handleError);
}

const getAllStrategies = (page: number, size: number): Promise<Page<TradingStrategyResult>> =>
  get(`${baseUrl}all-strategies?page=${page}&size=${size}`).then(adjustTradingStrategyResultArray)

export function search(dto: MarketBotStartDto): Promise<TradingStrategyResult> {
  return fetch(baseUrl + "search", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
  })
    .then(handleResponse)
    .catch(handleError);
}

export function searchByTradingStrategyId(
  id: number
): Promise<TradingStrategyResult> {
  return fetch(baseUrl + "search?tradingStrategyId=" + id)
    .then((response) =>
      handleResponse(response).then(adjustTradingStrategyResult)
    )
    .catch(handleError);
}

export function runHistory(
  dto: MarketBotStartDto
): Promise<TradingStrategyResult> {
  return fetch(baseUrl + "run-history", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
  })
    .then(handleResponse)
    .catch(handleError);
}

export function stopHistory(dto: MarketBotStartDto): Promise<any> {
  return fetch(baseUrl + "stop-history", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
  })
    .then(handleResponse)
    .catch(handleError);
}

export default {
  getFilterData,
  getSecurityHistoryDates,
  startBot,
  switchBotStatus,
  getAllStrategies,
  search,
  searchByTradingStrategyId,
  runHistory,
  stopHistory,
};
