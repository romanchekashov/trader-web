import {ClassCode} from "../../../data/ClassCode";
import {Interval} from "../../../data/Interval";
import {SecurityFilter} from "../../../data/SecurityFilter";

export class MarketStateFilterDto extends SecurityFilter {
    public classCode: ClassCode;
    public secCode: string;
    public intervals: Interval[];
    public numberOfCandles?: number;
    public start?: Date;
    public end?: Date;
    public fetchByWS?: boolean = false;
    public history?: boolean = false;
}