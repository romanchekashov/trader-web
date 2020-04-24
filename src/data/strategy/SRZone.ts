import {Interval} from "../Interval";
import {Candle} from "../Candle";

export class SRZone {
    public start: number;
    public end: number;
    public interval: Interval;
    public candles: Candle[];
    public intersects: number;
}