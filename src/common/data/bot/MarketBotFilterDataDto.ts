import {Broker} from "../Broker";
import {Interval} from "../Interval";
import {MarketSecuritiesDto} from "./MarketSecuritiesDto";

export class MarketBotFilterDataDto {
    public broker: Broker;
    public marketSecurities: MarketSecuritiesDto[];
    public intervals: Interval[];
}