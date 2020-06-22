import {TradingStrategyConfig} from "./TradingStrategyConfig";
import {TradePremise} from "./TradePremise";
import {TradingStrategyTrade} from "../history/TradingStrategyTrade";

export class TradingStrategyState {
    public config: TradingStrategyConfig;
    public tradingStrategyTrade: TradingStrategyTrade;
    public currentPremise: TradePremise;
}