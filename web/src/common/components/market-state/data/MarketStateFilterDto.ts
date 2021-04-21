import {Interval} from "../../../data/Interval";
import {SecurityFilter} from "../../../data/security/SecurityFilter";

export class MarketStateFilterDto extends SecurityFilter {
    public intervals: Interval[]
    public numberOfCandles?: number
    public fetchByWS?: boolean = false
    public history?: boolean = false
    public start?: Date
    public end?: Date
}