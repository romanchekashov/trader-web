import {ClassCode} from "./ClassCode";
import {Interval} from "./Interval";

export class TrendLineDto {
    public id?: number;
    public classCode?: ClassCode;
    public secCode: string;
    public interval: Interval;
    public start: number;
    public startTimestamp: Date;
    public end: number;
    public endTimestamp: Date;
    public deleted?: Date;
}