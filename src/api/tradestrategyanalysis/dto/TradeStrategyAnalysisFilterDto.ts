import {TradingPlatform} from "../../dto/TradingPlatform";
import {ClassCode} from "../../../common/data/ClassCode";
import {Interval} from "../../../common/data/Interval";

export class TradeStrategyAnalysisFilterDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
}