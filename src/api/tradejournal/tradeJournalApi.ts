import {ResultDto} from "./dto/ResultDto";
import {handleError, handleResponse} from "../apiUtils";
const baseUrl = process.env.API_URL + "/api/v1/trade-journal/";

export function getStat(): Promise<ResultDto[]> {
    return fetch(baseUrl + 'stat')
        .then(handleResponse)
        .catch(handleError);
}
