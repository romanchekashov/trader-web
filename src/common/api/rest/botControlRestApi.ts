import {handleError, handleResponse} from "../apiUtils";
import {MarketBotFilterDataDto} from "../../data/bot/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../../data/bot/MarketBotStartDto";
import {HistoryStrategyResultDto} from "../../data/history/HistoryStrategyResultDto";

const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-bot-control/";

export function getFilterData(history: boolean): Promise<MarketBotFilterDataDto> {
    return fetch(baseUrl + 'filter-data?history=' + history)
        .then(handleResponse)
        .catch(handleError);
}

export function startBot(dto: MarketBotStartDto): Promise<any> {
    return fetch(baseUrl + 'start-bot', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function getAllStrategies(): Promise<HistoryStrategyResultDto[]> {
    return fetch(baseUrl + 'all-strategies')
        .then(handleResponse)
        .catch(handleError);
}

export function search(dto: MarketBotStartDto): Promise<HistoryStrategyResultDto> {
    return fetch(baseUrl + 'search', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function runHistory(dto: MarketBotStartDto): Promise<HistoryStrategyResultDto> {
    return fetch(baseUrl + 'run-history', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function stopHistory(dto: MarketBotStartDto): Promise<any> {
    return fetch(baseUrl + 'stop-history', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}
