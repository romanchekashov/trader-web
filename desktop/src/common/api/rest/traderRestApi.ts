import {handleError, handleResponse} from "../apiUtils";
import {Interval} from "../../data/Interval";
import {Candle} from "../../data/Candle";
import {CreateStopDto} from "../../data/CreateStopDto";
import {SecurityFuture} from "../../data/SecurityFuture";
import {SecurityShare} from "../../data/SecurityShare";
import {SecurityCurrency} from "../../data/SecurityCurrency";

const baseUrl = process.env.API_URL + "/api/v1/";

export function getCandles(classCode: string, securityCode: string,
                           interval: Interval, numberOfCandles: number): Promise<Candle[]> {
    return fetch(`${baseUrl}candles?classCode=${classCode}&securityCode=${securityCode}&interval=${interval}&numberOfCandles=${numberOfCandles}`)
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
        .then(handleResponse)
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
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}