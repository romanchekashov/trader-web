import {Interval} from "./Interval";
import {SecurityFilter} from "./security/SecurityFilter";
import {TradeSystemType} from "./trading/TradeSystemType";

export class TradeStrategyAnalysisFilterDto extends SecurityFilter {
    public timeFrameTrading: Interval
    public timeFrameMin: Interval
    public tradeSystemType?: TradeSystemType
    public timestamp?: Date
}