import {TradingPlatform} from "./TradingPlatform";
import {ClassCode} from "../../data/ClassCode";
import {Interval} from "../../data/Interval";

export class TradeStrategyAnalysisFilterDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
}