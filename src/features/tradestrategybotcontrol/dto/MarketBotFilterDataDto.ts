import {Broker} from "./Broker";
import {SecurityInfo} from "./SecurityInfo";

export class MarketBotFilterDataDto {
    public broker: Broker;
    public marketSymbols: Map<string, SecurityInfo[]> ;
    public intervals: string[];
}