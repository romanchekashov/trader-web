import {ClassCode} from "./ClassCode";

export class Security {
    public classCode: ClassCode;
    public secCode: string;
    public name: string;
    public shortName: string;
    public lastTradePrice: number;
    public lastTradeTime: Date;
    public lastTradeQuantity: number;
    public todayMoneyTurnover: number;
    public numberOfTradesToday: number;
    public secPriceStep: number;
    public lastChange: number;
    public scale: number;
}