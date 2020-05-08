import {handleError, handleResponse} from "../apiUtils";
import {MarketBotFilterDataDto} from "../data/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../data/MarketBotStartDto";

const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-bot-control/";

export function getFilterData(): Promise<MarketBotFilterDataDto> {
    return fetch(baseUrl + 'filter-data')
        .then(handleResponse)
        .catch(handleError);
}

export function startBot(dto: MarketBotStartDto): Promise<any> {
    return fetch(baseUrl + 'start-bot', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function runHistory(dto: MarketBotStartDto): Promise<any> {
    return fetch(baseUrl + 'run-history', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function stopHistory(dto: MarketBotStartDto): Promise<any> {
    return fetch(baseUrl + 'stop-history', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dto)
    })
        .then(handleResponse)
        .catch(handleError);
}
