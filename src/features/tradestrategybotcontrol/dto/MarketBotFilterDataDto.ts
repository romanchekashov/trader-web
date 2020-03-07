import {Broker} from "./Broker";
import {SecurityInfo} from "./SecurityInfo";
import {Interval} from "./Interval";

export class MarketBotFilterDataDto {
    public broker: Broker;
    public marketSymbols: Map<string, SecurityInfo[]> ;
    public intervals: Interval[];
}