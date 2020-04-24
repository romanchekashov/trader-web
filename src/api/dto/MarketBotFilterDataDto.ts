import {Broker} from "./Broker";
import {SecurityInfo} from "./SecurityInfo";
import {Interval} from "../../data/Interval";
import {ClassCode} from "./ClassCode";

export class MarketSecuritiesDto {
    market: string;
    classCode: ClassCode;
    securities: SecurityInfo[];
}

export class MarketBotFilterDataDto {
    public broker: Broker;
    public marketSecurities: MarketSecuritiesDto[];
    public intervals: Interval[];
}