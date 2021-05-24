import { Candle } from "../../data/Candle";
import { Order } from "../../data/Order";
import { StopOrder } from "../../data/StopOrder";
import { TradingPlatformDataFilter } from "../../data/TradingPlatformDataFilter";
import { handleError, handleResponse } from "../apiUtils";

const baseUrl = process.env.API_URL + "/api/v1/";

export default {
  getCandles,
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
