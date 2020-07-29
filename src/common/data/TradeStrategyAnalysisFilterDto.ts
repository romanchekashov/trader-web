import {ClassCode} from "./ClassCode";
import {Interval} from "./Interval";
import {SecurityFilter} from "./SecurityFilter";

export class TradeStrategyAnalysisFilterDto extends SecurityFilter {
    public timeFrameTrading: Interval
    public timeFrameMin: Interval

    public classCode: ClassCode;
    public secCode: string;
}