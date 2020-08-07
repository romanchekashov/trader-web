import {TradePremise} from "../data/strategy/TradePremise";
import {MarketStateDto} from "../components/market-state/data/MarketStateDto";
import {SwingStateDto} from "../components/swing-state/data/SwingStateDto";
import {TradingStrategyResult} from "../data/history/TradingStrategyResult";
import {Trade} from "../data/Trade";
import {Order} from "../data/Order";
import {StopOrder} from "../data/StopOrder";
import {SecurityShare} from "../data/SecurityShare";
import {round100} from "./utils";
import {MoexOpenInterest} from "../data/open-interest/MoexOpenInterest";
import {SecurityShareEvent} from "../data/news/SecurityShareEvent";
import {NewsItem} from "../data/news/NewsItem";
import {EconomicCalendarEvent} from "../data/news/EconomicCalendarEvent";
import {Security} from "../data/Security";
import {Candle} from "../data/Candle";

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
    if (marketState) {
        for (const marketStateInterval of marketState.marketStateIntervals) {
            for (const item of marketStateInterval.items) {
                item.candle.timestamp = new Date(item.candle.timestamp);
            }
        }
    }
    return marketState;
}

export const adjustSwingStateDto = (state: SwingStateDto): SwingStateDto => {
    if (state) {
        for (const item of state.items) {
            item.start = new Date(item.start);
            item.end = new Date(item.end);
        }
    }
    return state;
}

export const adjustTrades = (trades: Trade[]): any => {
    if (trades && trades.length > 0) {
        for (const trade of trades) trade.dateTime = new Date(trade.dateTime)
    }

    return trades
}

export const adjustOrders = (orders: Order[]): any => {
    if (orders && orders.length > 0) {
        for (const order of orders) order.dateTime = new Date(order.dateTime)
    }

    return orders
}

export const adjustShares = (shares: SecurityShare[]): any => {
    if (shares && shares.length > 0) {
        for (const share of shares) {
            share.percentOfFloatTradedToday = share.issueSize > 0
                ? round100((share.voltoday / share.issueSize) * 100) : 0;
        }
    }

    return shares
}

export const adjustStopOrders = (orders: StopOrder[]): any => {
    if (orders && orders.length > 0) {
        for (const order of orders) order.dateTime = new Date(order.dateTime)
    }

    return orders
}

export const adjustMoexOpenInterestList = (list: MoexOpenInterest[]): any => {
    if (list && list.length > 0) {
        for (const item of list) item.dateTime = new Date(item.dateTime)
    }

    return list
}

export const adjustMoexOpenInterest = (item: MoexOpenInterest): any => {
    if (item) {
        item.dateTime = new Date(item.dateTime)
    }

    return item
}

export const adjustSecurityShareEvents = (list: SecurityShareEvent[]): any => {
    if (list && list.length > 0) {
        for (const item of list) {
            item.date = new Date(item.date)
            item.published = new Date(item.published)
        }
    }

    return list
}

export const adjustNewsItems = (list: NewsItem[]): any => {
    if (list && list.length > 0) {
        for (const item of list) item.timestamp = new Date(item.timestamp)
    }

    return list
}

export const adjustEconomicCalendarEvents = (list: EconomicCalendarEvent[]): any => {
    if (list && list.length > 0) {
        for (const item of list) item.dateTime = new Date(item.dateTime)
    }

    return list
}

export const adjustSecurities = (list: Security[]): any => {
    if (list && list.length > 0) {
        for (const item of list) item.lastTradeTime = new Date(item.lastTradeTime)
    }

    return list
}

export const adjustCandles = (candles: Candle[]): any => {
    if (candles && candles.length > 0) {
        for (const candle of candles) candle.timestamp = new Date(candle.timestamp)
    }

    return candles
}