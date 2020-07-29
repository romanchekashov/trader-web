import {ClassCode} from "./ClassCode";
import {Interval} from "./Interval";
import {SecurityType} from "./SecurityType";
import {Market} from "./Market";

export class TradingPlatformDataFilter {
    public secId: number

    public ticker: string
    public type: SecurityType
    public market: Market

    public classCode: ClassCode
    public secCode: string

    public interval: Interval
    public numberOfCandles: number
    public startTimestamp?: Date
}