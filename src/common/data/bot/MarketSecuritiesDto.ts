import {ClassCode} from "../ClassCode";
import {SecurityHistoryDatesDto} from "./SecurityHistoryDatesDto";

export class MarketSecuritiesDto {
    market: string
    classCode: ClassCode
    securityHistoryDates: SecurityHistoryDatesDto[]
}