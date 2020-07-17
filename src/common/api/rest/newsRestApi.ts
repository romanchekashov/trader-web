import {handleError, handleResponse} from "../apiUtils";
import {adjustEconomicCalendarEvents, adjustNewsItems} from "../../utils/DataUtils";
import {NewsItem} from "../../data/news/NewsItem";
import {EconomicCalendarEvent} from "../../data/news/EconomicCalendarEvent";
import {CalendarType} from "../../data/news/CalendarType";

const baseUrl = process.env.API_URL + "/api/v1/news/";

export function getNews(): Promise<NewsItem[]> {
    return fetch(baseUrl)
        .then(response => handleResponse(response)
            .then(adjustNewsItems))
        .catch(handleError);
}

export function getEconomicCalendarEvents(calendarType?: CalendarType, code?: string): Promise<EconomicCalendarEvent[]> {
    let url = `${baseUrl}economic-calendar`

    if (calendarType && code) {
        url += `?calendarType=${calendarType}&code=${code}`
    } else if (calendarType) {
        url += `?calendarType=${calendarType}`
    } else if (code) {
        url += `?code=${code}`
    }

    return fetch(url)
        .then(response => handleResponse(response)
            .then(adjustEconomicCalendarEvents))
        .catch(handleError);
}