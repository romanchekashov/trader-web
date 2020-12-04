import {handleError, handleResponse} from "../apiUtils";
import {Candle} from "../../data/Candle";
import {CreateStopDto} from "../../data/CreateStopDto";
import {SecurityFuture} from "../../data/security/SecurityFuture";
import {SecurityShare} from "../../data/security/SecurityShare";
import {SecurityCurrency} from "../../data/security/SecurityCurrency";
import {TradingPlatformDataFilter} from "../../data/TradingPlatformDataFilter";
import {adjustOrders, adjustShares} from "../../utils/DataUtils";
import {SecurityLastInfo} from "../../data/security/SecurityLastInfo";

const baseUrl = process.env.API_URL + "/api/v1/";

export function getCandles(filter: TradingPlatformDataFilter): Promise<Candle[]> {
    return fetch(`${baseUrl}candles`, {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
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
        .then(response => handleResponse(response)
            .then(adjustShares))
        .catch(handleError);
}

export function getAllSecurityCurrencies(): Promise<SecurityCurrency[]> {
    return fetch(`${baseUrl}security-currencies`)
        .then(handleResponse)
        .catch(handleError);
}

export function getLastSecurities(): Promise<SecurityLastInfo[]> {
    return fetch(`${baseUrl}last-securities`)
        .then(handleResponse)
        .catch(handleError);
}

export function createStop(dto: CreateStopDto): Promise<void> {
    return fetch(`${baseUrl}create-stop`, {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}