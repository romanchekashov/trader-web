import {NewsProvider} from "./NewsProvider";

export class EconomicCalendarEvent {
    public id: number;
    public dateTime: Date;
    public country: string;
    public currency: string;
    public expectedVolatility: string;
    public title: string;
    public eventType: string;
    public valueActual: string;
    public valueForecast: string;
    public valuePrevious: string;
    public valuePreviousRevised: string;
    public holiday: boolean;
    public newsProvider: NewsProvider;
    public href: string;
    public tags: any[];
}