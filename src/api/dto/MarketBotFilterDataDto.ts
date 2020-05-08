import {Broker} from "./Broker";
import {SecurityInfo} from "./SecurityInfo";
import {Interval} from "../../common/data/Interval";
import {ClassCode} from "../../common/data/ClassCode";

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