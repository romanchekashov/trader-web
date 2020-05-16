import {TrendDirection} from "./TrendDirection";
import {Interval} from "../Interval";
import {TrendPoint} from "./TrendPoint";

export class Trend {
    public direction: TrendDirection;
    public swingHighsLows: TrendPoint[];
    public interval: Interval;
}