import {ClassCode} from "./ClassCode";

export class SecurityLastInfo {
    public classCode: ClassCode;
    public secCode: string;
    public valueToday: number;
    public priceLastTrade: number;
    public timeLastTrade: Date;
    public quantityLastTrade: number;
    public valueLastTrade: number;
    public numTrades: number;

    public futureTotalDemand: number;
    public futureTotalSupply: number;
    public futureSellDepoPerContract: number;
    public futureBuyDepoPerContract: number;
}