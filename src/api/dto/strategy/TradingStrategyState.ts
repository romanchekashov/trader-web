import {TradingStrategyConfig} from "./TradingStrategyConfig";
import {TradePremise} from "./TradePremise";

export class TradingStrategyState {
    public config: TradingStrategyConfig;
    public currentPremise: TradePremise;
}