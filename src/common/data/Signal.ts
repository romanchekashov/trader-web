import {ClassCode} from "./ClassCode";
import {Interval} from "./Interval";

export class Signal {
    public name: string;
    public classCode: ClassCode;
    public secCode: string;
    public interval: Interval;
    public timestamp: Date;
    public price: number;
    public description: string;
}