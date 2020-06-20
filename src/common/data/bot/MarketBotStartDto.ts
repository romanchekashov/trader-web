import {TradingPlatform} from "../TradingPlatform";
import {Interval} from "../Interval";
import {ClassCode} from "../ClassCode";
import {DepositSetup} from "../DepositSetup";
import {TradingStrategyName} from "../trading/TradingStrategyName";
import {TradeSystemType} from "../trading/TradeSystemType";

export class MarketBotStartDto {
    public brokerId: number
    public tradingPlatform: TradingPlatform
    public classCode: ClassCode
    public secCode: string
    public strategy: TradingStrategyName
    public systemType: TradeSystemType

    public timeFrameTrading: Interval
    public timeFrameMin: Interval

    public depositSetup: DepositSetup
    public start: Date
    public end: Date
}