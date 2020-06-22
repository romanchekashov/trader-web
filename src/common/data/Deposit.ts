import {ClassCode} from "./ClassCode";
import {Broker} from "./Broker";

export class Deposit {
    id: number
    classCode: ClassCode
    amount: number
    previousAmount: number
    margin: number
    commission: number
    maxRiskPerTradeInPercent: number
    maxRiskPerSessionTimeoutInPercent: number
    maxRiskPerSessionInPercent: number
    broker: Broker
    created: Date
}