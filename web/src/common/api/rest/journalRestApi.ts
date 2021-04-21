import {ResultDto} from "../../data/journal/ResultDto";
import {handleError, handleResponse} from "../apiUtils";
import {TradeJournalFilterDto} from "../../../features/trade-journal/filter/TradeJournalFilterDto";
const baseUrl = process.env.API_URL + "/api/v1/trade-journal/";

export function getStat(filter: TradeJournalFilterDto): Promise<ResultDto[]> {
    return fetch(baseUrl + 'stat', {
        method: "POST", // POST for create, PUT to update when id already exists.
        headers: {"content-type": "application/json"},
        body: JSON.stringify(filter)
    })
        .then(handleResponse)
        .catch(handleError);
}
