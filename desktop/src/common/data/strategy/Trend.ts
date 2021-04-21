import {TrendDirection} from "./TrendDirection";
import {TrendPoint} from "./TrendPoint";
import {Interval} from "../Interval";

export class Trend {
    public direction: TrendDirection;
    public swingHighsLows: TrendPoint[];
    public interval: Interval;
}