import {SecurityHistoryDatesDto} from "./SecurityHistoryDatesDto";
import {SecurityType} from "../SecurityType";

export class MarketSecuritiesDto {
    market: string
    securityType: SecurityType
    securityHistoryDates: SecurityHistoryDatesDto[]
}