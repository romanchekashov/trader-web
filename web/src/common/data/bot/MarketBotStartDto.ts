import {Interval} from "../Interval";
import {DepositSetup} from "../DepositSetup";
import {TradingStrategyName} from "../trading/TradingStrategyName";
import {TradeSystemType} from "../trading/TradeSystemType";
import {SecurityFilter} from "../security/SecurityFilter";

export class MarketBotStartDto extends SecurityFilter {
    public strategy: TradingStrategyName
    public systemType: TradeSystemType

    public timeFrameTrading: Interval
    public timeFrameMin: Interval

    public depositSetup: DepositSetup
    public start: Date
    public end: Date
}