import { ClassCode } from "../ClassCode";
import { Currency } from "../Currency";
import { Market } from "../Market";
import { SecurityType } from "./SecurityType";

export class SecurityInfo {
    public id: number
    public classCode: ClassCode
    public code: string
    public secCode: string
    public ticker: string
    public type: SecurityType
    public market: Market

    public quik: boolean
    public apiTinkoff: boolean
    public currency: Currency
    public name: string
    public shortName: string
    public scale: number
    public expDate: Date
    public lotSize: number
    public minPriceStep: number
    public eveningSession: boolean
}