import {ClassCode} from "./ClassCode";
import {Interval} from "./Interval";

export class FilterDto {
    public classCode: ClassCode;
    public secCode: string;
    public interval?: Interval;
    public numberOfCandles?: number;
    public all?: boolean = false;
    public history?: boolean = false;
    public start?: Date;
    public end?: Date;
}