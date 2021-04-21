import {Interval} from "./Interval";

export class Candle {
    public secId: number
    public symbol: string
    public interval: Interval
    public timestamp: Date
    public open: number
    public high: number
    public low: number
    public close: number
    public volume: number
}