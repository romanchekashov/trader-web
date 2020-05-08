import {TradePremise} from "./TradePremise";
import {PriceActionSetup} from "./PriceActionSetup";
import {OperationType} from "../OperationType";

export class TradeSetup {
    public premise: TradePremise;
    public priceActionSetup: PriceActionSetup;

    public operation: OperationType;
    public stopPrice: number;
    public targetFirstPrice: number;
    public targetSecondPrice: number;
    public entryPrice: number;
    public created: Date;
}