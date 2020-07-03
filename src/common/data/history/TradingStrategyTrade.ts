import {Trade} from "../Trade";
import {TradeSetup} from "../strategy/TradeSetup";
import {TradingStrategyTradeState} from "./TradingStrategyTradeState";
import {OperationType} from "../OperationType";

export class TradingStrategyTrade {
  public trades: Trade[]
  public id: number
  public tradingStrategyId: number
  public setup: TradeSetup
  public operation: OperationType
  public state: TradingStrategyTradeState

  public enterOrderTransId: number
  public enterOrderNumber: number
  public lastWholesalePrice: number
  public lastRewardRiskRatioPrice: number
  public entryPrice: number
  public entryQuantity: number
  public realEntryPrice: number
  public realEntryQuantity: number

  public stopOrderTransId: number
  public stopPrice: number
  public realStopPrice: number
  public realStopQuantity: number

  public firstTargetOrderTransId: number
  public firstTargetOrderNumber: number
  public firstTargetPrice: number
  public firstTargetQuantity: number
  public realFirstTargetPrice: number
  public realFirstTargetQuantity: number

  public secondTargetStopOrderTransId: number
  public secondTargetOrderTransId: number
  public secondTargetOrderNumber: number
  public secondTargetPrice: number
  public secondTargetQuantity: number
  public realSecondTargetPrice: number
  public realSecondTargetQuantity: number

  public killOrderTransId: number
  public killOrderNumber: number
  public killQuantity: number
  public realKillPrice: number
  public realKillQuantity: number

  public killExceptionOrderTransId: number
  public killExceptionOrderNumber: number
  public killExceptionQuantity: number
  public realKillExceptionPrice: number
  public realKillExceptionQuantity: number

}
