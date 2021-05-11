import { Candle } from "../../data/Candle";
import { FuturesClientLimit } from "../../data/FuturesClientLimit";
import { Order } from "../../data/Order";
import { SecurityCurrency } from "../../data/security/SecurityCurrency";
import { SecurityFuture } from "../../data/security/SecurityFuture";
import { SecurityShare } from "../../data/security/SecurityShare";
import { StopOrder } from "../../data/StopOrder";
import { TradingPlatformDataFilter } from "../../data/TradingPlatformDataFilter";
import { adjustShares } from "../../utils/DataUtils";
import { handleError, handleResponse } from "../apiUtils";

const baseUrl = process.env.API_URL + "/api/v1/";

export default {
  getCandles,
  getFutureInfo,
  getAllSecurityFutures,
  getAllSecurityShares,
  getAllSecurityCurrencies,
  getFuturesLimits,
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

export function getFuturesLimits(): Promise<FuturesClientLimit[]> {
  return fetch(`${baseUrl}futures-limits`)
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
