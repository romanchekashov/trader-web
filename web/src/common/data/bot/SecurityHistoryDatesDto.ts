import {HistoryDateDto} from "./HistoryDateDto";
import {Security} from "../security/Security";

export class SecurityHistoryDatesDto {
    security: Security
    historyDates: HistoryDateDto[]
}