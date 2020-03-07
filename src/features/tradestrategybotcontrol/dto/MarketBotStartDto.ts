import {TradingPlatform} from "./TradingPlatform";
import {Interval} from "./Interval";

export class MarketBotStartDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: string;
    public secCode: string;
    public realDeposit: boolean = false;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
}