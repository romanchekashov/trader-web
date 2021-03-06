import {ClassCode} from "./ClassCode";
import {OperationType} from "./OperationType";
import {TradeSystemType} from "./trading/TradeSystemType";

export class Trade {
    public id: number
    public tradingPlatformTradeId: number
    public transId: number
    public orderNumber: string
    public classCode: ClassCode
    public secCode: string
    public tradingStrategyTradeId: number
    public systemType: TradeSystemType
    public price: number
    public quantity: number
    public operation: OperationType
    public value: number
    public dateTime: Date
}