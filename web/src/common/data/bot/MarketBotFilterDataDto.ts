import {Broker} from "../Broker";
import {Interval} from "../Interval";
import {MarketSecuritiesDto} from "./MarketSecuritiesDto";

export class MarketBotFilterDataDto {
    public brokers: Broker[];
    public marketSecurities: MarketSecuritiesDto[];
    public intervals: Interval[];
}