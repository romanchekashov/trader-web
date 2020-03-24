import {TrendDirection} from "./TrendDirection";

export class TrendPoint {
    public swingHL: number;
    public dateTime: string;
}

export class Trend {
    public direction: TrendDirection;
    public swingHighsLows: TrendPoint[];
}