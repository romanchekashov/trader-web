import {TradePremise} from "./TradePremise";
import {PriceActionSetup} from "./PriceActionSetup";

export class TradeSetup {
    public premise: TradePremise;
    public priceActionSetup: PriceActionSetup;
    public stopPrice: number;
    public targetPrice1: number;
    public targetPrice2: number;
    public entryPrice: number;
}