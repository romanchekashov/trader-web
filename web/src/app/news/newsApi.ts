import { get } from "../../common/api/apiUtils";
import { CalendarType } from "../../common/data/news/CalendarType";
import { EconomicCalendarEvent } from "../../common/data/news/EconomicCalendarEvent";
import { NewsItem } from "../../common/data/news/NewsItem";
import { NewsProvider } from "../../common/data/news/NewsProvider";
import {
  adjustEconomicCalendarEvents,
  adjustNewsItems
} from "../../common/utils/DataUtils";

const baseUrl = process.env.API_URL + "/api/v1/news/";

const getNews = (
  provider?: NewsProvider,
  secId?: number
): Promise<NewsItem[]> => {
  let url = "";

  if (provider && secId) {
    url += `?provider=${provider}&secId=${secId}`;
  } else if (provider) {
    url += `?provider=${provider}`;
  } else if (secId) {
    url += `?secId=${secId}`;
  }

  url += url ? "&" : "?";
  url += `page=0&size=1000`;

  return get<NewsItem[]>(baseUrl + url).then(adjustNewsItems);
}

const getEconomicCalendarEvents = (
  start: string,
  calendarType?: CalendarType,
  secId?: number
): Promise<EconomicCalendarEvent[]> => {
  let url = `${baseUrl}economic-calendar?start=${start}`;

  if (calendarType && secId) {
    url += `&calendarType=${calendarType}&secId=${secId}`;
  } else if (calendarType) {
    url += `&calendarType=${calendarType}`;
  } else if (secId) {
    url += `&secId=${secId}`;
  }

  return get<EconomicCalendarEvent[]>(url).then(adjustEconomicCalendarEvents);
}

export default {
  getNews,
  getEconomicCalendarEvents
}