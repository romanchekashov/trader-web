import {Interval} from "./Interval";
import {TradingPlatform} from "./TradingPlatform";

export class TradeStrategyAnalysisFilterDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: string;
    public secCode: string;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
}