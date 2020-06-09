import {ClassCode} from "./ClassCode";
import {Interval} from "./Interval";

export class TradingPlatformDataFilter {
    public classCode: ClassCode;
    public secCode: string;
    public interval: Interval;
    public numberOfCandles: number;
    public useCache: boolean = true;
    public startTimestamp?: Date;
}