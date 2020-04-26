import {JournalTradeDto} from "./JournalTradeDto";
import {Broker} from "../../dto/Broker";

export class ResultDto {
  public trades: JournalTradeDto[];
  public broker: Broker;
  public totalGainAndLoss: number;
  public avgDailyGainAndLoss: number;
  public avgDailyVolume: number;
  public avgWinTrade: number;
  public avgLossTrade: number;
  public totalTrades: number;
  public winTrades: number;
  public lossTrades: number;
  public scratchTrades: number;
  public maxConsecutiveWins: number;
}
