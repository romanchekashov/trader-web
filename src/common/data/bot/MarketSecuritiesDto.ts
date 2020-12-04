import {SecurityHistoryDatesDto} from "./SecurityHistoryDatesDto";
import {SecurityType} from "../security/SecurityType";

export class MarketSecuritiesDto {
    market: string
    securityType: SecurityType
    securityHistoryDates: SecurityHistoryDatesDto[]
}