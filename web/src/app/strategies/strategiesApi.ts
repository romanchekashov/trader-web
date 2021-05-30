import { get, handleError, handleResponse, post } from "../../common/api/apiUtils";
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

const getFilterData = (
  history: boolean
): Promise<MarketBotFilterDataDto> => get(`${baseUrl}filter-data?history=${history}`);

const getSecurityHistoryDates = (
  type: SecurityType,
  secCode: string
): Promise<SecurityHistoryDatesDto> => get(`${baseUrl}security-history-dates?type=${type}&secCode=${secCode}`)

const startBot = (dto: MarketBotStartDto): Promise<any> => post(`${baseUrl}start-bot`, dto);

const switchBotStatus = (
  tradingStrategyId: number,
  tradingStrategyStatus: TradingStrategyStatus
): Promise<void> => get(`${baseUrl}switch-bot-status?tradingStrategyId=${tradingStrategyId}&tradingStrategyStatus=${tradingStrategyStatus}`);

const getAllStrategies = (status: TradingStrategyStatus, page: number, size: number): Promise<Page<TradingStrategyResult>> =>
  get<Page<TradingStrategyResult>>(`${baseUrl}all-strategies?${status ? `status=${status}&` : ""}page=${page}&size=${size}`)
  .then(page => {
    page.content.forEach(adjustTradingStrategyResult);
    return page;
  })

const search = (dto: MarketBotStartDto): Promise<TradingStrategyResult> => post(`${baseUrl}search`, dto);

const searchByTradingStrategyId = (
  id: number
): Promise<TradingStrategyResult> => {
  return fetch(baseUrl + "search?tradingStrategyId=" + id)
    .then((response) =>
      handleResponse(response).then(adjustTradingStrategyResult)
    )
    .catch(handleError);
}

const runHistory = (
  dto: MarketBotStartDto
): Promise<TradingStrategyResult> => {
  return fetch(baseUrl + "run-history", {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
  })
    .then(handleResponse)
    .catch(handleError);
}

const stopHistory = (dto: MarketBotStartDto): Promise<any> => {
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
