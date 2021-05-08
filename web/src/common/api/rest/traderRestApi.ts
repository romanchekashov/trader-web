import { handleError, handleResponse } from "../apiUtils";
import { Candle } from "../../data/Candle";
import { CreateStopDto } from "../../data/CreateStopDto";
import { SecurityFuture } from "../../data/security/SecurityFuture";
import { SecurityShare } from "../../data/security/SecurityShare";
import { SecurityCurrency } from "../../data/security/SecurityCurrency";
import { TradingPlatformDataFilter } from "../../data/TradingPlatformDataFilter";
import { adjustShares } from "../../utils/DataUtils";
import { FuturesClientLimit } from "../../data/FuturesClientLimit";
import { ActiveTrade } from "../../data/ActiveTrade";
import { Order } from "../../data/Order";
import { StopOrder } from "../../data/StopOrder";

const baseUrl = process.env.API_URL + "/api/v1/";

export default {
  getCandles,
  getFutureInfo,
  getAllSecurityFutures,
  getAllSecurityShares,
  getAllSecurityCurrencies,
  createStop,
  getFuturesLimits,
  getActiveTrades,
  getActiveOrders,
  getActiveStopOrders,
};

export function getCandles(
  filter: TradingPlatformDataFilter
): Promise<Candle[]> {
  return fetch(`${baseUrl}candles`, {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(filter),
  })
    .then(handleResponse)
    .catch(handleError);
}

export function getFutureInfo(securityCode: string): Promise<Candle[]> {
  return fetch(`${baseUrl}future-info?securityCode=${securityCode}`)
    .then(handleResponse)
    .catch(handleError);
}

export function getAllSecurityFutures(): Promise<SecurityFuture[]> {
  return fetch(`${baseUrl}security-futures`)
    .then(handleResponse)
    .catch(handleError);
}

export function getAllSecurityShares(): Promise<SecurityShare[]> {
  return fetch(`${baseUrl}security-shares`)
    .then((response) => handleResponse(response).then(adjustShares))
    .catch(handleError);
}

export function getAllSecurityCurrencies(): Promise<SecurityCurrency[]> {
  return fetch(`${baseUrl}security-currencies`)
    .then(handleResponse)
    .catch(handleError);
}

export function createStop(dto: CreateStopDto): Promise<void> {
  return fetch(`${baseUrl}create-stop`, {
    method: "POST", // POST for create, PUT to update when id already exists.
    headers: { "content-type": "application/json" },
    body: JSON.stringify(dto),
  })
    .then(handleResponse)
    .catch(handleError);
}

export function getFuturesLimits(): Promise<FuturesClientLimit[]> {
  return fetch(`${baseUrl}futures-limits`)
    .then(handleResponse)
    .catch(handleError);
}

export function getActiveTrades(): Promise<ActiveTrade[]> {
  return fetch(`${baseUrl}active-trades`)
    .then(handleResponse)
    .catch(handleError);
}

export function getActiveOrders(): Promise<Order[]> {
  return fetch(`${baseUrl}active-orders`)
    .then(handleResponse)
    .catch(handleError);
}

export function getActiveStopOrders(): Promise<StopOrder[]> {
  return fetch(`${baseUrl}active-stop-orders`)
    .then(handleResponse)
    .catch(handleError);
}
