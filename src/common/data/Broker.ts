import {Currency} from "./Currency";
import {TradingPlatform} from "./trading/TradingPlatform";
import {BrokerId} from "./BrokerId";

export class Broker {
    public id: number;
    public name: BrokerId;
    public site: string;
    public currency: Currency;
    public tradingPlatform: TradingPlatform;
    public securitiesMarketCommissionPerTransaction: number;
    public derivativesMarketCommissionPerTransaction: number;
    public fxMarketCommissionPerTransaction: number;
    public monthlyCommission: number;
    public updated: Date;
}