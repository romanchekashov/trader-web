import {Interval} from "../Interval";
import {Candle} from "../Candle";

export class SRZone {
    public start: number;
    public end: number;
    public interval: Interval;
    public intervals: Interval[];
    public candles: Candle[];
    public intersects: number;
    public timestamp: Date;
}