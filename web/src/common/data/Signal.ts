import {Interval} from "./Interval";
import {SecurityType} from "./security/SecurityType";
import {Market} from "./Market";

export class Signal {
    public secId: number
    public name: string
    public strength: string
    public ticker: string
    public securityType: SecurityType
    public market: Market
    public interval: Interval
    public price: number
    public timestamp: Date
    public description: string
}