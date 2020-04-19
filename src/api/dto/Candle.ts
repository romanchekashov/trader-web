import {Interval} from "./Interval";

export class Candle {
    public symbol: string;
    public open: number;
    public high: number;
    public low: number;
    public close: number;
    public volume: number;
    public timestamp: Date;
    public interval: Interval;
}