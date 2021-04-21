import {TradingStrategyConfig} from "./TradingStrategyConfig";
import {SRLevels} from "./SRLevels";
import {Trend} from "./Trend";
import {MarketSecurityMomentum} from "./MarketSecurityMomentum";
import {TradePremise} from "./TradePremise";
import {TradeSetup} from "./TradeSetup";
import {SRZone} from "./SRZone";
import {SRLevel} from "./SRLevel";

export class MarketSecurityAnalysisInfo {
    public tradingStrategyConfig: TradingStrategyConfig;
    public htSRLevels: SRLevels;
    public srZones: SRZone[];
    public srLevels: SRLevel[];
    public trends: Trend[];
    public trend: Trend;
    public tfLowTrend: Trend;
    public tfHighTrend: Trend;
    public momentum: MarketSecurityMomentum;
    public premise: TradePremise;
    public tradeSetup: TradeSetup;
}