import {TradingPlatform} from "./TradingPlatform";
import {Interval} from "./Interval";
import {ClassCode} from "../../../api/dto/ClassCode";

export class MarketBotStartDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;
    public realDeposit: boolean = false;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
}