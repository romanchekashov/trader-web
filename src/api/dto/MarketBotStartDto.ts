import {TradingPlatform} from "./TradingPlatform";
import {Interval} from "../../data/Interval";
import {ClassCode} from "./ClassCode";

export class MarketBotStartDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: ClassCode;
    public secCode: string;
    public realDeposit?: boolean = false;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
    public history?: boolean = false;
    public start?: Date;
    public end?: Date;
}