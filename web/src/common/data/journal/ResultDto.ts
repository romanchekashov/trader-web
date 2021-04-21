import {JournalTradeDto} from "./JournalTradeDto";
import {Broker} from "../Broker";
import {StatDto} from "./StatDto";

export class ResultDto extends StatDto {
    public trades: JournalTradeDto[];
    public broker: Broker;
}
