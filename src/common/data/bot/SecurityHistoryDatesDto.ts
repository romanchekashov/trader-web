import {SecurityInfo} from "../SecurityInfo";
import {HistoryDateDto} from "./HistoryDateDto";

export class SecurityHistoryDatesDto {
    security: SecurityInfo
    historyDates: HistoryDateDto[]
}