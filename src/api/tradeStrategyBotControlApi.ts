import { handleResponse, handleError } from "./apiUtils";
import {MarketBotFilterDataDto} from "../features/tradestrategybotcontrol/dto/MarketBotFilterDataDto";
const baseUrl = process.env.API_URL + "/api/v1/trade-strategy-bot-control/";

export function getFilterData(): Promise<MarketBotFilterDataDto> {
    return fetch(baseUrl + 'filter-data')
        .then(handleResponse)
        .catch(handleError);
}

export function saveCourse(course: any) {
    return fetch(baseUrl + (course.id || ""), {
        method: course.id ? "PUT" : "POST", // POST for create, PUT to update when id already exists.
        headers: { "content-type": "application/json" },
        body: JSON.stringify(course)
    })
        .then(handleResponse)
        .catch(handleError);
}

export function deleteCourse(courseId: any) {
    return fetch(baseUrl + courseId, { method: "DELETE" })
        .then(handleResponse)
        .catch(handleError);
}
