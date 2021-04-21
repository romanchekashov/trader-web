import {Interval} from "../Interval";
import {DepositSetup} from "../DepositSetup";
import {SecurityFilter} from "../security/SecurityFilter";
import {TradeSystemType} from "../trading/TradeSystemType";
import {TradingStrategyName} from "../trading/TradingStrategyName";

export class TradingStrategyConfig extends SecurityFilter {
    public timeFrameTrading: Interval
    public timeFrameMin: Interval
    public depositSetup: DepositSetup
    public systemType: TradeSystemType
    public tradingStrategyId: number
    public strategyName: TradingStrategyName
    public key: string
}