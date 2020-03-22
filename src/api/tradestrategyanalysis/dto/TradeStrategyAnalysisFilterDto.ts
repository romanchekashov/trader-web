import {TradingPlatform} from "../../dto/TradingPlatform";
import {ClassCode} from "../../dto/ClassCode";
import {Interval} from "../../dto/Interval";

export class TradeStrategyAnalysisFilterDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
}