import {JournalTradeDto} from "./JournalTradeDto";
import {Broker} from "../Broker";

export class ResultDto {
  public trades: JournalTradeDto[];
  public broker: Broker;
  public totalGainAndLoss: number;
  public avgDailyGainAndLoss: number;
  public avgDailyVolume: number;
  public avgWinTrade: number;
  public avgWinTradeQuantity: number;
  public avgLossTrade: number;
  public avgLossTradeQuantity: number;
  public totalTrades: number;
  public winTrades: number;
  public lossTrades: number;
  public scratchTrades: number;
  public maxConsecutiveWins: number;

  public largestGain: number;
  public largestLoss: number;
  public avgPerShareGainAndLoss: number;
  public avgTradeGainAndLoss: number;
  public tradeProfitAndLossStdDeviation: number;
  public profitFactor: number;
  public avgHoldTimeWinTradesSeconds: number;
  public avgHoldTimeLossTradesSeconds: number;
  public avgHoldTimeScratchTradesSeconds: number;
  public maxConsecutiveLosses: number;

  public totalCommissions: number;
  public totalFees: number;
}
