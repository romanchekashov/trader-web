import {handleError, handleResponse} from "../apiUtils";
import {FilterDto} from "../../data/FilterDto";
import {TrendLineDto} from "../../data/TrendLineDto";

const baseUrl = process.env.API_URL + "/api/v1/trend-line/";

export function getTrendLines(filter: FilterDto): Promise<TrendLineDto[]> {
    return fetch(baseUrl, {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function saveTrendLines(trendLines: TrendLineDto[]): Promise<TrendLineDto[]> {
    return fetch(baseUrl + 'save', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(trendLines)
    })
        .then(handleResponse)
        .catch(handleError);
}
