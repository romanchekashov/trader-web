import {Interval} from "../Interval";
import {DepositSetup} from "../DepositSetup";
import {HistorySetup} from "../HistorySetup";
import {TradingStrategyName} from "../trading/TradingStrategyName";
import {SecurityFilter} from "../security/SecurityFilter";

export class HistoryStartDto extends SecurityFilter {
    public timeFrameTrading: Interval
    public timeFrameMin: Interval

    public depositSetup: DepositSetup
    public historySetup: HistorySetup

    public strategy: TradingStrategyName
    public tradingStrategyId: number
}