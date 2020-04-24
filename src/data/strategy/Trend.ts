import {TrendDirection} from "./TrendDirection";
import {Interval} from "../Interval";

export class TrendPoint {
    public swingHL: number;
    public dateTime: string;
}

export class Trend {
    public direction: TrendDirection;
    public swingHighsLows: TrendPoint[];
    public interval: Interval;
}