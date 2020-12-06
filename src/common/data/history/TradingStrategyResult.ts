import {ResultDto} from "../journal/ResultDto";
import {TradingStrategyData} from "./TradingStrategyData";
import {TradeSetup} from "../strategy/TradeSetup";
import {TradePremise} from "../strategy/TradePremise";

export class TradingStrategyResult {
    public tradingStrategyData: TradingStrategyData
    public stat: ResultDto
    public tradeSetup: TradeSetup
    public tradePremise: TradePremise
}
