import {TradingStrategyConfig} from "./TradingStrategyConfig";
import {SRLevels} from "./SRLevels";
import {Trend} from "./Trend";
import {MarketSecurityMomentum} from "./MarketSecurityMomentum";
import {TradePremise} from "./TradePremise";
import {TradeSetup} from "./TradeSetup";

export class MarketSecurityAnalysisInfo {
    public tradingStrategyConfig: TradingStrategyConfig;
    public htSRLevels: SRLevels;
    public trend: Trend;
    public momentum: MarketSecurityMomentum;
    public premise: TradePremise;
    public tradeSetup: TradeSetup;
}