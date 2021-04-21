import {Interval} from "./Interval";
import {SecurityFilter} from "./security/SecurityFilter";
import {SignalType} from "./SignalType";

export class FilterDto extends SecurityFilter {
    public interval?: Interval
    public numberOfCandles?: number
    public all?: boolean = false
    public fetchByWS?: boolean = false
    public history?: boolean = false
    public start?: Date
    public end?: Date
    public type?: SignalType
}