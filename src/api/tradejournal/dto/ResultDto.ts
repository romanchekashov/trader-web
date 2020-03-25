import {JournalTradeDto} from "./JournalTradeDto";
import {Broker} from "../../dto/Broker";

export class ResultDto {
  public trades: JournalTradeDto[];
  public totalGainAndLoss: number;
  public broker: Broker;
}
