import {PriceActionSetup} from "./PriceActionSetup";
import {OngoingAnalysis} from "./OngoingAnalysis";
import {MarketSecurityAnalysisInfo} from "./MarketSecurityAnalysisInfo";
import {MarketStateDto} from "../../components/market-state/data/MarketStateDto";
import {SwingStateDto} from "../../components/swing-state/data/SwingStateDto";
import {MarketStateIntervalDto} from "../../components/market-state/data/MarketStateIntervalDto";

export class TradePremise {
    public analysis: MarketSecurityAnalysisInfo;
    public sentiment: OngoingAnalysis;
    public priceActionSetup: PriceActionSetup;

    public marketState: MarketStateDto;
    public marketStateTradingInterval: MarketStateIntervalDto;
    public marketStateMinInterval: MarketStateIntervalDto;
    public swingStateTradingInterval: SwingStateDto;
    public swingStateMinInterval: SwingStateDto;

    public entryPrice: number;
    public stopPrice: number;
    public targetPrice1: number;
    public targetPrice2: number;
}