import {PriceActionSetup} from "./PriceActionSetup";
import {OngoingAnalysis} from "./OngoingAnalysis";
import {MarketSecurityAnalysisInfo} from "./MarketSecurityAnalysisInfo";

export class TradePremise {
    public analysis: MarketSecurityAnalysisInfo;
    public sentiment: OngoingAnalysis;
    public priceActionSetup: PriceActionSetup;
    public entryPrice: number;
    public stopPrice: number;
    public targetPrice1: number;
    public targetPrice2: number;
}