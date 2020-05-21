import {ClassCode} from "../ClassCode";
import {SecurityInfo} from "../SecurityInfo";

export class MarketSecuritiesDto {
    market: string;
    classCode: ClassCode;
    securities: SecurityInfo[];
    securityHistoryDate: any
}