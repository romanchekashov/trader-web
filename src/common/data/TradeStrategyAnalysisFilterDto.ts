import {Interval} from "./Interval";
import {SecurityFilter} from "./SecurityFilter";
import {TradeSystemType} from "./trading/TradeSystemType";

export class TradeStrategyAnalysisFilterDto extends SecurityFilter {
    public timeFrameTrading: Interval
    public timeFrameMin: Interval
    public tradeSystemType?: TradeSystemType
}