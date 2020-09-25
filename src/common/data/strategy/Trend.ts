import {TrendDirection} from "./TrendDirection";
import {Interval} from "../Interval";
import {TrendPoint} from "./TrendPoint";
import {TrendPower} from "./TrendPower";

export class Trend {
    public direction: TrendDirection
    public power: TrendPower
    public swingHighsLows: TrendPoint[]
    public interval: Interval
}