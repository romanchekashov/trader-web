import {handleError, handleResponse} from "./apiUtils";
import {SecurityShare} from "./dto/SecurityShare";
import {SecurityCurrency} from "./dto/SecurityCurrency";
import {SecurityFuture} from "./dto/SecurityFuture";
import {Candle} from "./dto/Candle";
import {Interval} from "./dto/Interval";

const baseUrl = process.env.API_URL + "/api/v1/";

export function getCandles(classCode: string, securityCode: string,
                           interval: Interval, numberOfCandles: number): Promise<Candle[]> {
    return fetch(`${baseUrl}candles?classCode=${classCode}&securityCode=${securityCode}&interval=${interval}&numberOfCandles=${numberOfCandles}`)
        .then(handleResponse)
        .catch(handleError);
}

export function getSecurityShares(): Promise<SecurityShare[]> {
    return fetch(baseUrl + 'security-shares')
        .then(handleResponse)
        .catch(handleError);
}

export function getSecurityCurrencies(): Promise<SecurityCurrency[]> {
    return fetch(baseUrl + 'security-currencies')
        .then(handleResponse)
        .catch(handleError);
}

export function getSecurityFutures(): Promise<SecurityFuture[]> {
    return fetch(baseUrl + 'security-futures')
        .then(handleResponse)
        .catch(handleError);
}
