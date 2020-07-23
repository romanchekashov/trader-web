import {ClassCode} from "./ClassCode";

export class Security {
    public id: number;
    public classCode: ClassCode;
    public code: string;
    public secCode: string;
    public name: string;
    public shortName: string;
    public secPriceStep: number;
    public scale: number;

    public lastTradePrice: number;
    public lastTradeTime: Date;
    public lastTradeQuantity: number;
    public lastTradeValue: number;

    public lastChange: number;
    public numTradesToday: number;
    public valueToday: number;
    public volumeToday: number;
}