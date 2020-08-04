import {Interval} from "./Interval";

export class TrendLineDto {
    public id?: number
    public secId?: number
    public interval: Interval
    public start: number
    public startTimestamp: Date
    public end: number
    public endTimestamp: Date
    public deleted?: Date
}