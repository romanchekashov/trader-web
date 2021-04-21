import {Interval} from "../Interval";
import {TradingPlatform} from "../TradingPlatform";

export class HistoryStartDto {
    public brokerId: number;
    public tradingPlatform: TradingPlatform;
    public classCode: string;
    public secCode: string;
    public realDeposit: boolean;
    public timeFrameHigh: Interval;
    public timeFrameTrading: Interval;
    public timeFrameLow: Interval;
    public start: Date;
    public end: Date;
}