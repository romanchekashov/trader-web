import { MarketStateDto } from "../components/market-state/data/MarketStateDto";
import { SwingStateDto } from "../components/swing-state/data/SwingStateDto";
import { Candle } from "../data/Candle";
import { TradingStrategyResult } from "../data/history/TradingStrategyResult";
import { EconomicCalendarEvent } from "../data/news/EconomicCalendarEvent";
import { ExpectedVolatility } from "../data/news/ExpectedVolatility";
import { NewsItem } from "../data/news/NewsItem";
import { SecurityShareEvent } from "../data/news/SecurityShareEvent";
import { MoexOpenInterest } from "../data/open-interest/MoexOpenInterest";
import { Order } from "../data/Order";
import { Security } from "../data/security/Security";
import { SecurityLastInfo } from "../data/security/SecurityLastInfo";
import { SecurityShare } from "../data/security/SecurityShare";
import { SecurityType } from "../data/security/SecurityType";
import { SecurityTypeWrapper } from "../data/security/SecurityTypeWrapper";
import { StopOrder } from "../data/StopOrder";
import { TradePremise } from "../data/strategy/TradePremise";
import { Trade } from "../data/Trade";
import { round100 } from "./utils";

export const adjustTradingStrategyResultArray = (
  results: TradingStrategyResult[]
): any => {
  for (const result of results) {
    adjustTradingStrategyResult(result);
  }

  return results;
};

export const adjustTradingStrategyResult = (
  result: TradingStrategyResult
): any => {
  if (result) {
    if (result.tradePremise) {
      adjustTradePremise(result.tradePremise);
    }
    if (result.tradeSetup && result.tradeSetup.premise) {
      adjustTradePremise(result.tradeSetup.premise);
    }
    if (result.tradingStrategyData) {
      if (result.tradingStrategyData.start) {
        result.tradingStrategyData.start = new Date(
          result.tradingStrategyData.start
        );
      }
      if (result.tradingStrategyData.end) {
        result.tradingStrategyData.end = new Date(
          result.tradingStrategyData.end
        );
      }
      result.tradingStrategyData.trades.forEach((tsTrade) =>
        tsTrade.trades.forEach(
          (trade) => (trade.dateTime = new Date(trade.dateTime))
        )
      );
    }
  }

  return result;
};

export const adjustTradePremise = (premise: TradePremise): void => {
  if (premise) {
    if (premise.analysis.srZones) {
      for (const srZone of premise.analysis.srZones) {
        srZone.timestamp = new Date(srZone.timestamp);
      }
    }

    if (premise.analysis.trends) {
      for (const trend of premise.analysis.trends) {
        for (const trendPoint of trend.swingHighsLows) {
          trendPoint.dateTime = new Date(trendPoint.dateTime);
        }
      }
    }

    adjustMarketState(premise.marketState);
    adjustSwingStateDto(premise.swingStateTradingInterval);
    adjustSwingStateDto(premise.swingStateMinInterval);
  }
};

export const adjustMarketState = (marketState: MarketStateDto): any => {
  if (marketState) {
    for (const marketStateInterval of marketState.marketStateIntervals) {
      for (const item of marketStateInterval.items) {
        item.candle.timestamp = new Date(item.candle.timestamp);
        item.signals.forEach((signal) => {
          signal.timestamp = new Date(signal.timestamp);
        });
      }
    }
  }
  return marketState;
};

export const adjustSwingStateDto = (state: SwingStateDto): SwingStateDto => {
  if (state) {
    for (const item of state.items) {
      item.start = new Date(item.start);
      item.end = new Date(item.end);
    }
  }
  return state;
};

export const adjustTrades = (trades: Trade[]): any => {
  if (trades && trades.length > 0) {
    for (const trade of trades) trade.dateTime = new Date(trade.dateTime);
  }

  return trades;
};

export const adjustOrder = (order: Order): Order => {
  order.dateTime = new Date(order.dateTime);
  return order;
};
export const adjustOrders = (orders: Order[]): any => {
  if (orders && orders.length > 0) {
    for (const order of orders) adjustOrder(order);
  }

  return orders;
};

export const adjustShares = (shares: SecurityShare[]): any => {
  if (shares && shares.length > 0) {
    for (const share of shares) {
      share.percentOfFreeFloatTradedToday =
        share.issueSize > 0
          ? round100((share.volumeToday / share.issueSize) * 100)
          : 0;
    }
  }

  return shares;
};

export const adjustStopOrder = (order: StopOrder): StopOrder => {
  order.dateTime = new Date(order.dateTime);
  return order;
};

export const adjustStopOrders = (orders: StopOrder[]): any => {
  if (orders && orders.length > 0) {
    for (const order of orders) adjustStopOrder(order);
  }

  return orders;
};

export const adjustMoexOpenInterestList = (list: MoexOpenInterest[]): any => {
  if (list && list.length > 0) {
    for (const item of list) item.dateTime = new Date(item.dateTime);
  }

  return list;
};

export const adjustMoexOpenInterest = (item: MoexOpenInterest): any => {
  if (item) {
    item.dateTime = new Date(item.dateTime);
  }

  return item;
};

export const adjustSecurityShareEvents = (list: SecurityShareEvent[]): any => {
  if (list && list.length > 0) {
    for (const item of list) {
      item.published = new Date(item.published);
    }
  }

  return list;
};

export const adjustNewsItems = (list: NewsItem[]): any => {
  if (list && list.length > 0) {
    for (const item of list) item.timestamp = new Date(item.timestamp);
  }

  return list;
};

const expectedVolatilityValue = {
  [ExpectedVolatility.High]: 3,
  [ExpectedVolatility.Moderate]: 2,
  [ExpectedVolatility.Low]: 1,
};

export const sortEconomicCalendarEventsByVolatility = (list: EconomicCalendarEvent[]) => {
  list.sort((a, b) => {
    const diff = a.dateTime.getTime() - b.dateTime.getTime();
    if (diff !== 0) return diff;
    return (
      expectedVolatilityValue[b.expectedVolatility] -
      expectedVolatilityValue[a.expectedVolatility]
    );
  })
}

export const adjustEconomicCalendarEvents = (
  list: EconomicCalendarEvent[]
): any => {

  if (list && list.length > 0) {
    for (const item of list) item.dateTime = new Date(item.dateTime);
  }

  sortEconomicCalendarEventsByVolatility(list);

  return list;
};

export const adjustSecurity = (item: Security): any => {
  item.lastTradeTime = new Date(item.lastTradeTime);
  return item;
};

export const adjustSecurities = (list: Security[]): any => {
  if (list && list.length > 0) {
    for (const item of list) adjustSecurity(item);
  }

  return list;
};

export const adjustCandles = (candles: Candle[]): any => {
  if (candles && candles.length > 0) {
    for (const candle of candles) candle.timestamp = new Date(candle.timestamp);
  }

  return candles;
};

export const filterSecurities = (
  securities: SecurityLastInfo[],
  secType: SecurityTypeWrapper
): SecurityLastInfo[] => {
  return securities.filter((value) => {
    switch (secType) {
      case SecurityTypeWrapper.FUTURE:
        return value.type === SecurityType.FUTURE;
      case SecurityTypeWrapper.STOCK:
        return value.type === SecurityType.STOCK;
      case SecurityTypeWrapper.STOCK_1:
        return value.type === SecurityType.STOCK && value.shareSection === 1;
      case SecurityTypeWrapper.STOCK_2:
        return value.type === SecurityType.STOCK && value.shareSection === 2;
      case SecurityTypeWrapper.STOCK_3:
        return value.type === SecurityType.STOCK && value.shareSection === 3;
      case SecurityTypeWrapper.CURRENCY:
        return value.type === SecurityType.CURRENCY;
    }
  });
};

export const sortSecurities = (
  securities: SecurityLastInfo[]
): SecurityLastInfo[] => {
  const weight = {
    [SecurityType.STOCK]: 3,
    [SecurityType.FUTURE]: 2,
    [SecurityType.CURRENCY]: 1
  };

  return securities.sort((a, b) => {
    let result = weight[b.type] - weight[a.type];

    // if (!result) {
    //   if (a.ticker < b.ticker) result = -1;
    //   if (a.ticker > b.ticker) result = 1;
    // }
    if (!result) {
      result = b.lastChange - a.lastChange;
    }

    return result;
  });
};

export const getMinDepoPerContract = (security: SecurityLastInfo): number => {

  if (security) {
    const { futureBuyDepoPerContract, futureSellDepoPerContract } = security;

    if (futureBuyDepoPerContract && futureSellDepoPerContract) {
      return futureBuyDepoPerContract > futureSellDepoPerContract ? futureBuyDepoPerContract : futureSellDepoPerContract;
    }
  }

  return 1;
}