import {Broker} from "./Broker";
import {SecurityInfo} from "./SecurityInfo";
import {Interval} from "./Interval";

export class MarketSecuritiesDto {
    market: string;
    classCode: string;
    securities: SecurityInfo[];
}

export class MarketBotFilterDataDto {
    public broker: Broker;
    public marketSecurities: MarketSecuritiesDto[];
    public intervals: Interval[];
}