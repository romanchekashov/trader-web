import {Trade} from "../Trade";
import {TradeSetup} from "../strategy/TradeSetup";
import {TradingStrategyTradeState} from "./TradingStrategyTradeState";
import {OperationType} from "../OperationType";

export class TradingStrategyTrade {
  public trades: Trade[]
  public id: string
  public operation: OperationType
  public setup: TradeSetup

  public enterOrderNumber: number
  public stopOrderTransactionId: number
  public firstTargetOrderNumber: number
  public secondTargetOrderNumber: number
  public killOrderNumber: number
  public killExceptionOrderNumber: number
  public state: TradingStrategyTradeState

  // Entry preconditions
  public stopPrice: number
  public targetPrice1: number
  public targetPrice2: number
  public lastWholesalePrice: number
  public lastRewardRiskRatioPrice: number
  public quantity: number

  // real numbers from trading platform
  public realEntryQuantity: number
  public realEntryPrice: number
  public realStoppedPrice: number
  public realTargetPrice1: number
  public realTargetPrice2: number
  public realKillPrice: number
  public realKillExceptionPrice: number
  public leftQuantity: number
}
