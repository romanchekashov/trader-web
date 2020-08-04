import {ClassCode} from "./ClassCode";
import {SecurityType} from "./SecurityType";
import {Market} from "./Market";
import {Currency} from "./Currency";

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
}