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

export function getEconomicCalendarEvents(calendarType?: CalendarType, secId?: number): Promise<EconomicCalendarEvent[]> {
    let url = `${baseUrl}economic-calendar`

    if (calendarType && secId) {
        url += `?calendarType=${calendarType}&secId=${secId}`
    } else if (calendarType) {
        url += `?calendarType=${calendarType}`
    } else if (secId) {
        url += `?secId=${secId}`
    }

    return fetch(url)
        .then(response => handleResponse(response)
            .then(adjustEconomicCalendarEvents))
        .catch(handleError);
}