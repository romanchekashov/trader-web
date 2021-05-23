import { handleError, handleResponse } from "../apiUtils";
import { adjustCandles, adjustSecurities } from "../../utils/DataUtils";
import { SecurityLastInfo } from "../../data/security/SecurityLastInfo";
import { Candle } from "../../data/Candle";
import { SecurityType } from "../../data/security/SecurityType";
import { Interval } from "../../data/Interval";

const baseUrl = process.env.API_URL + "/api/v1/tinkoff-invest/";

export default {
  getLastSecurities,
  getCandles,
};

function getLastSecurities(): Promise<SecurityLastInfo[]> {
  return fetch(`${baseUrl}last-securities`)
    .then((response) => handleResponse(response).then(adjustSecurities))
    .catch(handleError);
}

function getCandles(
  type: SecurityType,
  ticker: string,
  from: string,
  to: string,
  interval: Interval
): Promise<Candle[]> {
  return fetch(
    `${baseUrl}candles?type=${type}&ticker=${ticker}&from=${from}&to=${to}&interval=${interval}`
  )
    .then((response) => handleResponse(response).then(adjustCandles))
    .catch(handleError);
}
