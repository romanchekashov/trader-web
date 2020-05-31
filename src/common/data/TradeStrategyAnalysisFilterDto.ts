import {TradingPlatform} from "./TradingPlatform";
import {ClassCode} from "./ClassCode";
import {Interval} from "./Interval";

export class TradeStrategyAnalysisFilterDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;
    public timeFrameTrading: Interval;
    public timeFrameMin: Interval;
}