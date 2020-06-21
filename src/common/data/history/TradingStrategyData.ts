import {TradingStrategyTrade} from "./TradingStrategyTrade";
import {TradingStrategyName} from "../trading/TradingStrategyName";
import {Broker} from "../Broker";
import {TradingPlatform} from "../TradingPlatform";
import {SecurityInfo} from "../SecurityInfo";
import {Interval} from "../Interval";
import {TradeSystemType} from "../trading/TradeSystemType";
import {TradingStrategyStatus} from "../trading/TradingStrategyStatus";

export class TradingStrategyData {
    public id: number
    public name: TradingStrategyName
    public broker: Broker
    public tradingPlatform: TradingPlatform
    public security: SecurityInfo
    public interval: Interval
    public intervalHistoryMin: Interval
    public deposit: number
    public maxRiskPerTradeInPercent: number
    public maxRiskPerSessionInPercent: number
    public firstTakeProfitPerTradeFactor: number
    public secondTakeProfitPerTradeFactor: number
    public systemType: TradeSystemType
    public status: TradingStrategyStatus
    public start: Date
    public end: Date
    public trades: TradingStrategyTrade[]
}
