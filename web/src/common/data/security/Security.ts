import {ClassCode} from "../ClassCode";
import {SecurityType} from "./SecurityType";
import {Market} from "../Market";
import {Currency} from "../Currency";

export class Security {
    public id: number
    public classCode: ClassCode
    public code: string
    public secCode: string
    public ticker: string
    public type: SecurityType
    public market: Market

    public name: string
    public shortName: string

    public secPriceStep: number
    public scale: number
    public figi: string
    public currency: Currency
    public isin: string

    public lastTradePrice: number
    public lastTradeTime: Date
    public lastTradeQuantity: number
    public lastTradeValue: number

    public lastChange: number
    public change: number
    public numTradesToday: number
    public valueToday: number
    public volumeToday: number

    public totalDemand: number
    public totalSupply: number

    public quik: boolean
}