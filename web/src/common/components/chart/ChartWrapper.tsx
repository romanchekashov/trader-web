import * as React from "react";
import { useState, useEffect } from "react";
import { PossibleTrade } from "../../../app/possibleTrades/data/PossibleTrade";
import { getHistoryCandles } from "../../api/rest/historyRestApi";
import { getCandles } from "../../api/rest/traderRestApi";
import { getTrendLines, saveTrendLines } from "../../api/rest/TrendLineRestApi";
import { WebsocketService, WSEvent } from "../../api/WebsocketService";
import { ActiveTrade } from "../../data/ActiveTrade";
import { BrokerId } from "../../data/BrokerId";
import { Candle } from "../../data/Candle";
import { FilterDto } from "../../data/FilterDto";
import { Interval } from "../../data/Interval";
import { Market } from "../../data/Market";
import { Order } from "../../data/Order";
import { SecurityLastInfo } from "../../data/security/SecurityLastInfo";
import { StopOrder } from "../../data/StopOrder";
import { TradePremise } from "../../data/strategy/TradePremise";
import { Trend } from "../../data/strategy/Trend";
import { Trade } from "../../data/Trade";
import { TradingPlatform } from "../../data/trading/TradingPlatform";
import { TrendLineDto } from "../../data/TrendLineDto";
import { TrendWrapper } from "../../data/TrendWrapper";
import { IntervalColor, StoreData } from "../../utils/utils";
import { PatternResult } from "../alerts/data/PatternResult";
import { CandleStickChartForDiscontinuousIntraDay } from "./CandleStickChartForDiscontinuousIntraDay";
import ChartWrapperHead from "./ChartWrapperHead/ChartWrapperHead";
import { ChartDrawType } from "./data/ChartDrawType";
import { ChartElementAppearance } from "./data/ChartElementAppearance";
import { ChartManageOrder } from "./data/ChartManageOrder";
import { ChartTrendLine } from "./data/ChartTrendLine";
import { ChartTrendLineType } from "./data/ChartTrendLineType";
import moment = require("moment");
import "./ChartWrapper.css";

const _ = require("lodash");

export const CHART_MIN_WIDTH = 200;

const chartTrendLineDefaultAppearance: ChartElementAppearance = {
  edgeFill: "#FFFFFF",
  edgeStroke: "#000000",
  edgeStrokeWidth: 1,
  r: 6,
  stroke: "#000000",
  strokeDasharray: "Solid",
  strokeOpacity: 1,
  strokeWidth: 1,
};

const swingHighsLowsTimeFrameTradingIntervals = {
  M1: [Interval.M3, Interval.M1],
  M3: [Interval.M30, Interval.M3],
  M5: [Interval.M60, Interval.M5],
  M15: [Interval.H2, Interval.M15],
  M30: [Interval.H4, Interval.M30],
  M60: [Interval.DAY, Interval.M60],
  H2: [Interval.DAY, Interval.H2],
  H4: [Interval.WEEK, Interval.H4],
  DAY: [Interval.WEEK, Interval.DAY],
  WEEK: [Interval.MONTH, Interval.WEEK],
  MONTH: [Interval.MONTH, Interval.WEEK],
};

let initialStateTrendLines: TrendLineDto[] = [];

type Props = {
  interval: Interval;
  onIntervalChanged: (interval: Interval) => void;
  onStartChanged: (start: Date) => void;
  onPremiseBeforeChanged?: (before: Date) => void;
  width: number;
  chartHeight?: number;
  start?: Date;
  initialNumberOfCandles?: number;
  security: SecurityLastInfo;
  premise?: TradePremise;
  stops?: StopOrder[];
  orders?: Order[];
  trades?: Trade[];
  history?: boolean;
  trend?: Trend;
  showGrid?: boolean;
  activeTrade?: ActiveTrade;
  alert?: PatternResult;
  possibleTrade?: PossibleTrade;
  onManageOrder?: (manageOrder: ChartManageOrder) => void;
};

export const ChartWrapper: React.FC<Props> = ({
  interval,
  onIntervalChanged,
  onStartChanged,
  onPremiseBeforeChanged,
  width,
  chartHeight,
  start,
  initialNumberOfCandles = 500,
  security,
  premise,
  stops,
  orders,
  trades,
  history,
  trend,
  showGrid,
  activeTrade,
  alert,
  possibleTrade,
  onManageOrder
}) => {

  const [candles, setCandles] = useState<Candle[]>([]);
  const [lastCandles, setLastCandles] = useState<Candle[]>([]);
  const [nodata, setNodata] = useState<boolean>(false);
  const [innerInterval, setInnerInterval] = useState<Interval>(interval);
  const [innerStart, setInnerStart] = useState<Date>(start);
  const [enableTrendLine, setEnableTrendLine] = useState<boolean>(false);
  const [enableNewOrder, setEnableNewOrder] = useState<boolean>(false);
  const [needSave, setNeedSave] = useState<boolean>(false);
  const [storeData, setStoreData] = useState<StoreData<TrendLineDto[]>>();
  const [trendLines, setTrendLines] = useState<TrendLineDto[]>([]);
  const [trends_1, setTrends_1] = useState<ChartTrendLine[]>([]);
  const [showSRLevels, setShowSRLevels] = useState<boolean>(true);
  const [showSRZones, setShowSRZones] = useState<boolean>(true);
  const [numberOfCandles, setNumberOfCandles] = useState<number>(initialNumberOfCandles);
  const [startCalendarVisible, setStartCalendarVisible] = useState<boolean>(!!start);

  useEffect(() => {
    const wsCandleFilter = getWsCandleFilter(security, innerInterval);

    const candlesSetupSubscription = WebsocketService.getInstance()
      .on<Candle[]>(WSEvent.CANDLES)
      .subscribe(setLastCandles);

    const wsStatusSub = WebsocketService.getInstance()
      .connectionStatus()
      .subscribe((isConnected) => {
        if (isConnected) {
          requestCandles(security);
        }
      });

    // setTimeout(() => {
    //   onNumberOfCandlesUpdated(numberOfCandles);
    // }, 1000);

    return () => {
      if (candlesSetupSubscription)
        candlesSetupSubscription.unsubscribe();
      if (wsStatusSub) wsStatusSub.unsubscribe();
      WebsocketService.getInstance().send<FilterDto>(
        WSEvent.REMOVE_CANDLES,
        wsCandleFilter
      );
    }
  }, [security?.id, innerInterval]);

  useEffect(() => {
    setInnerStart(start);
  }, [start]);

  useEffect(() => {
    setInnerInterval(interval);
  }, [interval]);

  useEffect(() => {
    fetchTrendLines(interval);
  }, [security?.id, interval]);

  useEffect(() => {
    fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  }, [security?.id, innerInterval, innerStart, numberOfCandles]);

  const getNewCandles = (
    security: SecurityLastInfo,
    interval: Interval,
    start: Date,
    numberOfCandles: number
  ): Promise<Candle[]> => {

    if (history) {
      return getHistoryCandles(
        security.classCode,
        security.secCode,
        interval,
        numberOfCandles
      );
    } else {
      return getCandles({
        secId: security.id,
        ticker: security.ticker,
        type: security.type,
        market: security.market,
        secCode: security.secCode,
        classCode: security.classCode,
        interval,
        numberOfCandles,
        startTimestamp: startCalendarVisible ? start : null,
      });
    }
  };

  const updateCandles = (candles: Candle[], security: SecurityLastInfo) => {
    // console.log('updateCandles', candles[0].symbol, candles[0].interval, candles.length);

    if (candles && candles.length <= 1) {
      setCandles([]);
      setNodata(true);
    } else {
      setCandles(candles);
      setNodata(false);
      setTrends_1(mapTrendLinesFromPropsToState(trendLines, candles));
      requestCandles(security);
    }
  };

  const fetchCandles = (
    security: SecurityLastInfo,
    interval: Interval,
    start: Date,
    numberOfCandles: number
  ) => {
    if (!security) return;

    setCandles([]);
    setLastCandles([]);

    getNewCandles(security, interval, start, numberOfCandles)
      .then((data) => {
        updateCandles(
          data.map((c) => {
            c.timestamp = new Date(c.timestamp);
            return c;
          }),
          security
        );
      })
      .catch((reason) => {
        fetchCandles(security, interval, start, numberOfCandles);
      });
  };

  const fetchTrendLines = (interval: Interval): void => {
    if (security) {
      getTrendLines({
        brokerId:
          security.market === Market.SPB
            ? BrokerId.TINKOFF_INVEST
            : BrokerId.ALFA_DIRECT,
        tradingPlatform:
          security.market === Market.SPB
            ? TradingPlatform.API
            : TradingPlatform.QUIK,
        secId: security.id,
        interval,
      })
        .then(setTrendLinesFromServer)
        .catch((e) => console.error(e));
    }
  };

  const setTrendLinesFromServer = (trendLinesFromServer: TrendLineDto[]): void => {
    if (trendLines.length !== trendLinesFromServer.length) {
      for (const t of trendLinesFromServer) {
        t.startTimestamp = new Date(t.startTimestamp);
        t.endTimestamp = new Date(t.endTimestamp);
      }

      initialStateTrendLines = trendLinesFromServer;
      setTrendLines(trendLinesFromServer);
      setTrends_1(mapTrendLinesFromPropsToState(
        trendLinesFromServer,
        candles
      ));
    }
  };

  const mapTrendLinesFromPropsToState = (
    trendLines: TrendLineDto[],
    candles: Candle[]
  ): ChartTrendLine[] => {
    chartTrendLineDefaultAppearance.stroke =
      IntervalColor[innerInterval] || "#000000";
    chartTrendLineDefaultAppearance.edgeStroke =
      IntervalColor[innerInterval] || "#000000";

    const newTrends: ChartTrendLine[] = [];

    for (const t of trendLines) {
      const startIndex = candles.findIndex(
        (value) => value.timestamp.getTime() === t.startTimestamp.getTime()
      );
      const endIndex = candles.findIndex(
        (value) => value.timestamp.getTime() === t.endTimestamp.getTime()
      );
      if (startIndex > -1 && endIndex > -1) {
        newTrends.push({
          start: [startIndex, t.start],
          end: [endIndex, t.end],
          selected: false,
          type: ChartTrendLineType.RAY,
          appearance: chartTrendLineDefaultAppearance,
          id: t.id,
        });
      }
    }
    return newTrends;
  };

  const getWsCandleFilter = (security, innerInterval): FilterDto => ({
    brokerId:
      security?.market === Market.SPB
        ? BrokerId.TINKOFF_INVEST
        : BrokerId.ALFA_DIRECT,
    tradingPlatform:
      security?.market === Market.SPB
        ? TradingPlatform.API
        : TradingPlatform.QUIK,
    secId: security?.id,
    interval: innerInterval,
    numberOfCandles: 2,
  });

  const requestCandles = (security: SecurityLastInfo): void => {
    if (security && innerInterval) {
      WebsocketService.getInstance().send<FilterDto>(
        WSEvent.GET_CANDLES,
        getWsCandleFilter(security, innerInterval)
      );
    }
  };

  const getHighTimeFrameSRLevels = () => {
    // const {premise} = this.props;
    //
    // if (premise && premise.analysis.htSRLevels) {
    //     const resistanceLevels = premise.analysis.htSRLevels.resistanceLevels;
    //     const supportLevels = premise.analysis.htSRLevels.supportLevels;
    //     return [
    //         ...ChartWrapper.mapChartSRLevels(resistanceLevels, {stroke: "red"}),
    //         ...ChartWrapper.mapChartSRLevels(supportLevels, {stroke: "green"})
    //     ];
    // }
    return [];
  };

  const getSwingHighsLowsMap = (): TrendWrapper[] => {

    if (interval && premise && premise.analysis.trends) {
      const intervals: Interval[] =
        swingHighsLowsTimeFrameTradingIntervals[interval];
      const trendWrappers = premise.analysis.trends
        .filter((trend) => intervals.indexOf(trend.interval) !== -1)
        .map((trend) => ({
          trend,
          isSelectedTimeFrame: trend.interval === interval,
        }));

      const trendPoints = trendWrappers.filter((t) => t.isSelectedTimeFrame)[0]
        .trend.swingHighsLows;
      const all = {};
      for (const trendPoint of trendPoints) {
        all[trendPoint.swingHL] = trendPoint.dateTime;
      }

      trendWrappers
        .filter((t) => !t.isSelectedTimeFrame)
        .forEach((trendWraps) => {
          // if (trendWraps.trend.interval === Interval.DAY && interval === Interval.H4) {
          //     for (const trendPoint of trendWraps.trend.swingHighsLows) {
          //         trendPoint.dateTime = moment(trendPoint.dateTime).hours(8).minutes(0).seconds(0).toDate();
          //     }
          // } else if (trendWraps.trend.interval === Interval.DAY && interval === Interval.H2) {
          //     for (const trendPoint of trendWraps.trend.swingHighsLows) {
          //         trendPoint.dateTime = moment(trendPoint.dateTime).hours(10).minutes(0).seconds(0).toDate();
          //     }
          // } else {
          // }
          for (const trendPoint of trendWraps.trend.swingHighsLows) {
            if (all[trendPoint.swingHL]) {
              trendPoint.dateTime = all[trendPoint.swingHL];
            }
          }
        });

      return trendWrappers;
    }

    return null;
  };

  const getCandlePatternsUp = () => {
    let map = null;
    if (alert && alert.possibleFutureDirectionUp) {
      map = {};
      map[moment(alert.candle.timestamp).toDate().getTime()] = alert.candle.low;
    }

    return map;
  };

  const getCandlePatternsDown = () => {
    let map = null;
    if (alert && !alert.possibleFutureDirectionUp) {
      map = {};
      map[moment(alert.candle.timestamp).toDate().getTime()] =
        alert.candle.high;
    }

    return map;
  };

  const onIntervalUpdated = (e: any) => {
    const innerInterval: Interval = e.value;
    setInnerInterval(innerInterval);
    fetchTrendLines(innerInterval);
    onIntervalChanged(innerInterval);
    fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  const onStartUpdated = (innerStart: Date) => {
    setInnerStart(innerStart);
    onStartChanged(innerStart);
    fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  const onNumberOfCandlesUpdated = (numberOfCandles: number) => {
    setNumberOfCandles(numberOfCandles);
    fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  const onNumberOfCandlesUpdatedWrapper = (e: any) => {
    onNumberOfCandlesUpdated(e.target["value"]);
  };

  const onEnableTrendLine = (enableTrendLine: boolean) => {
    setEnableTrendLine(enableTrendLine);
  };

  const onEnableTrendLineWrapper = (e: any) => {
    onEnableTrendLine(e.value);
  };

  const onEnableNewOrder = (enableNewOrder: boolean) => {
    setEnableNewOrder(enableNewOrder);
  };

  const onEnableNewOrderWrapper = (e: any) => {
    onEnableNewOrder(e.value);
  };

  const onSave = () => {
    if (storeData) {
      console.log(storeData);
      const saving = [];

      if (storeData.save && storeData.save.length > 0) {
        for (const trendLine of storeData.save) {
          trendLine.secId = security.id;
          saving.push(trendLine);
        }
      }

      if (storeData.delete && storeData.delete.length > 0) {
        for (const trendLine of storeData.delete) {
          trendLine.secId = security.id;
          trendLine.deleted = new Date();
          saving.push(trendLine);
        }
      }

      if (saving.length > 0) {
        saveTrendLines(saving)
          .then(setTrendLinesFromServer)
          .catch(console.error);
      }
    }

    setNeedSave(false);
  };

  const onCancel = () => {
    setNeedSave(false);
    setStoreData(null);
    setTrendLines(initialStateTrendLines);
    setTrends_1(mapTrendLinesFromPropsToState(initialStateTrendLines, candles));
  };

  const onNeedSave = (storeData: StoreData<TrendLineDto[]>): void => {
    const newTrendLines = [];
    if (storeData.save && storeData.save.length > 0) {
      for (const trendLine of storeData.save) {
        newTrendLines.push(trendLine);
      }
    }

    setStoreData(storeData);
    setNeedSave(true);
    setTrendLines(newTrendLines);
    setTrends_1(mapTrendLinesFromPropsToState(newTrendLines, candles));
  };

  const showStartCalendar = () => {
    const newStartCalendarVisible = !startCalendarVisible;
    const innerStart = newStartCalendarVisible
      ? moment().subtract(1, "days").hours(9).minutes(0).seconds(0).toDate()
      : null;

    setStartCalendarVisible(newStartCalendarVisible);
    setInnerStart(innerStart);

    fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  const getSRLevels = () => {
    if (!premise || !showSRLevels) return null;

    // return premise.analysis.srLevels.filter(value => {
    //     switch (innerInterval) {
    //         case Interval.M3:
    //             return Interval.M30 === value.interval
    //         case Interval.M5:
    //             return Interval.M60 === value.interval
    //         default:
    //             return true
    //     }
    // })

    return premise.analysis.srLevels.filter((value) => {
      switch (innerInterval) {
        case Interval.M60:
          return Interval.M30 !== value.interval;
        case Interval.H2:
          return (
            Interval.M30 !== value.interval && Interval.M60 !== value.interval
          );
        case Interval.H4:
          return (
            Interval.M30 !== value.interval &&
            Interval.M60 !== value.interval &&
            Interval.H2 !== value.interval
          );
        case Interval.DAY:
          return (
            Interval.M30 !== value.interval &&
            Interval.M60 !== value.interval &&
            Interval.H2 !== value.interval &&
            Interval.H4 !== value.interval
          );
        case Interval.WEEK:
        case Interval.MONTH:
          return (
            Interval.M30 !== value.interval &&
            Interval.M60 !== value.interval &&
            Interval.H2 !== value.interval &&
            Interval.H4 !== value.interval &&
            Interval.DAY !== value.interval
          );
        default:
          return true;
      }
    });
  };

  const manageOrder = (order: ChartManageOrder) => {
    if (onManageOrder) onManageOrder(order);
  };

  let visibleCandles = candles;

  // if (security?.lastTradePrice) {
  //   const lastCandle = candles[candles.length - 1];

  //   if (lastCandle) {

  //     if (security.lastTradePrice > lastCandle.high) {
  //       lastCandle.high = security.lastTradePrice;
  //     } else if (security.lastTradePrice < lastCandle.low) {
  //       lastCandle.low = security.lastTradePrice;
  //     }

  //     lastCandle.close = security.lastTradePrice;
  //     lastCandle.volume += security.lastTradeQuantity;

  //     visibleCandles = [...candles];
  //   }
  // }

  if (lastCandles.length && candles.length > 2 && lastCandles.length > 0 && innerInterval === lastCandles[0].interval) {
    // console.log("lastCandles: ", lastCandles[0].interval)
    const candlesIndexMap = {};
    let newCandles = null;
    let needUpdateTrendLines = false;
    candlesIndexMap[candles[candles.length - 2].timestamp.getTime()] =
      candles.length - 2;
    candlesIndexMap[candles[candles.length - 1].timestamp.getTime()] =
      candles.length - 1;

    for (const candle of lastCandles) {
      candle.timestamp = new Date(candle.timestamp);
      const index = candlesIndexMap[candle.timestamp.getTime()];
      if (index) {
        candles[index] = candle;
      } else {
        newCandles = candles.slice(1);
        newCandles.push(candle);
        needUpdateTrendLines = true;
      }
    }

    newCandles = newCandles ? newCandles : [...candles];
    visibleCandles = newCandles;

    if (needUpdateTrendLines) {
      setCandles(newCandles);
      if (trendLines.length) {
        setTrends_1(mapTrendLinesFromPropsToState(
          trendLines,
          newCandles
        ));
      }
    }
  }

  if (!security) {
    return <>Select security for chart</>;
  }

  const stopOrders: StopOrder[] =
    stops?.filter(({ secId }) => secId === security.id) || [];

  return (
    <>
      <ChartWrapperHead
        security={security}
        innerInterval={innerInterval}
        onIntervalUpdated={onIntervalUpdated}
        numberOfCandles={numberOfCandles}
        onNumberOfCandlesUpdatedWrapper={onNumberOfCandlesUpdatedWrapper}
        startCalendarVisible={startCalendarVisible}
        showStartCalendar={showStartCalendar}
        innerStart={innerStart}
        onStartUpdated={onStartUpdated}
        onPremiseBeforeChanged={onPremiseBeforeChanged}
        enableNewOrder={enableNewOrder}
        onEnableNewOrderWrapper={onEnableNewOrderWrapper}
        enableTrendLine={enableTrendLine}
        onEnableTrendLineWrapper={onEnableTrendLineWrapper}
        needSave={needSave}
        onSave={onSave}
        onCancel={onCancel}
        showSRLevels={showSRLevels}
        updateShowSRLevels={e => setShowSRLevels(e.value)}
        showSRZones={showSRZones}
        updateShowSRZones={e => setShowSRZones(e.value)}
      />
      {candles.length > 0 ? (
        <CandleStickChartForDiscontinuousIntraDay
          type={ChartDrawType.CANVAS_SVG}
          data={visibleCandles}
          width={width}
          chartHeight={chartHeight}
          ratio={1}
          htSRLevels={getHighTimeFrameSRLevels()}
          stops={stopOrders}
          orders={orders}
          onManageOrder={manageOrder}
          trades={trades}
          activeTrade={activeTrade}
          swingHighsLows={getSwingHighsLowsMap()}
          showGrid={showGrid}
          zones={premise && showSRZones ? premise.analysis.srZones : null}
          srLevels={getSRLevels()}
          candlePatternsUp={getCandlePatternsUp()}
          candlePatternsDown={getCandlePatternsDown()}
          securityInfo={security}
          enableTrendLine={enableTrendLine}
          onEnableTrendLine={onEnableTrendLine}
          enableNewOrder={enableNewOrder}
          onEnableNewOrder={onEnableNewOrder}
          needSave={onNeedSave}
          trends={trends_1}
          possibleTrade={possibleTrade}
        />
      ) : nodata ? (
        <div>No data</div>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
}
