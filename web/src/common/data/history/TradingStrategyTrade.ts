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
  public enterLastWholesalePrice: number
  public enterLastRewardRiskRatioPrice: number
  public entryPrice: number
  public entryQuantity: number
  public entryRealPrice: number
  public entryRealQuantity: number

  public stopOrderTransId: number
  public stopPrice: number
  public stopRealPrice: number
  public stopRealQuantity: number

  public firstTargetOrderTransId: number
  public firstTargetOrderNumber: number
  public firstTargetPrice: number
  public firstTargetQuantity: number
  public firstTargetRealPrice: number
  public firstTargetRealQuantity: number

  public secondTargetStopOrderTransId: number
  public secondTargetOrderTransId: number
  public secondTargetOrderNumber: number
  public secondTargetPrice: number
  public secondTargetQuantity: number
  public secondTargetRealPrice: number
  public secondTargetRealQuantity: number

  public killOrderTransId: number
  public killOrderNumber: number
  public killQuantity: number
  public killRealPrice: number
  public killRealQuantity: number

  public killExceptionOrderTransId: number
  public killExceptionOrderNumber: number
  public killExceptionQuantity: number
  public killExceptionRealPrice: number
  public killExceptionRealQuantity: number

}
