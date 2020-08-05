import {Security} from "./Security";

export class SecurityFuture extends Security {
    public lastTradeMoneyTurnover: number;
    public numberOfInstrumentsInAnonymousTransactions: number;
    public buyDepoPerContract: number;
    public sellDepoPerContract: number;
    public stepPrice: number;
    public stepPriceForNewContract: number;
    public currencyStepPrice: string;
    public expDate: Date;
    public daysToExpDate: number;
}