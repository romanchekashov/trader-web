import {handleError, handleResponse} from "../apiUtils";
import {Interval} from "../../data/Interval";
import {Candle} from "../../data/Candle";
import {HistoryStartDto} from "../../data/history/HistoryStartDto";

const baseUrl = process.env.API_URL + "/api/v1/";
const historyUrl = baseUrl + "history/";

export function getHistoryCandles(classCode: string, securityCode: string,
                           interval: Interval, numberOfCandles: number): Promise<Candle[]> {
    return fetch(`${historyUrl}candles?classCode=${classCode}&securityCode=${securityCode}&interval=${interval}&numberOfCandles=${numberOfCandles}`)
        .then(handleResponse)
        .catch(handleError);
}

export function startHistory(dto: HistoryStartDto): Promise<any> {
    return fetch(`${historyUrl}start`, {
            method: "POST", // POST for create, PUT to update when id already exists.
            headers: { "content-type": "application/json" },
            body: JSON.stringify(dto)
        })
        .then(handleResponse)
        .catch(handleError);
}

export function stopHistory(dto: HistoryStartDto): Promise<any> {
    return fetch(`${historyUrl}start`, {
            method: "POST", // POST for create, PUT to update when id already exists.
            headers: { "content-type": "application/json" },
            body: JSON.stringify(dto)
        })
        .then(handleResponse)
        .catch(handleError);
}