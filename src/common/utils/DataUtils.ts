import {TradePremise} from "../data/strategy/TradePremise";
import {MarketStateDto} from "../components/market-state/data/MarketStateDto";
import {SwingStateDto} from "../components/swing-state/data/SwingStateDto";
import {TradingStrategyResult} from "../data/history/TradingStrategyResult";

export const adjustTradingStrategyResultArray = (results: TradingStrategyResult[]): TradingStrategyResult[] => {
    for (const result of results) {
        adjustTradingStrategyResult(result)
    }

    return results
}

export const adjustTradingStrategyResult = (result: TradingStrategyResult): any => {
    if (result) {
        if (result.tradePremise) {
            adjustTradePremise(result.tradePremise)
        }
        if (result.tradeSetup && result.tradeSetup.premise) {
            adjustTradePremise(result.tradeSetup.premise)
        }
    }

    return result
}

export const adjustTradePremise = (premise: TradePremise): void => {
    if (premise) {
        if (premise.analysis.srZones) {
            for (const srZone of premise.analysis.srZones) {
                srZone.timestamp = new Date(srZone.timestamp)
            }
        }

        if (premise.analysis.trends) {
            for (const trend of premise.analysis.trends) {
                for (const trendPoint of trend.swingHighsLows) {
                    trendPoint.dateTime = new Date(trendPoint.dateTime);
                }
            }
        }

        adjustMarketState(premise.marketState)
        adjustSwingStateDto(premise.swingStateTradingInterval)
        adjustSwingStateDto(premise.swingStateMinInterval)
    }
};

export const adjustMarketState = (marketState: MarketStateDto): any => {
    for (const marketStateInterval of marketState.marketStateIntervals) {
        for (const item of marketStateInterval.items) {
            item.candle.timestamp = new Date(item.candle.timestamp);
        }
    }
    return marketState;
}

export const adjustSwingStateDto = (state: SwingStateDto): SwingStateDto => {
    for (const item of state.items) {
        item.start = new Date(item.start);
        item.end = new Date(item.end);
    }
    return state;
}