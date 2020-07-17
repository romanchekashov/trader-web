import {handleError, handleResponse} from "../apiUtils";
import {adjustNewsItems} from "../../utils/DataUtils";
import {NewsItem} from "../../data/news/NewsItem";

const baseUrl = process.env.API_URL + "/api/v1/news/";

export function getNews(): Promise<NewsItem[]> {
    return fetch(baseUrl)
        .then(response => handleResponse(response)
            .then(adjustNewsItems))
        .catch(handleError);
}