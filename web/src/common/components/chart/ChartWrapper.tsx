import * as React from "react";
import { SubscriptionLike } from "rxjs";
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
import "./ChartWrapper.css";
import ChartWrapperHead from "./ChartWrapperHead/ChartWrapperHead";
import { ChartDrawType } from "./data/ChartDrawType";
import { ChartElementAppearance } from "./data/ChartElementAppearance";
import { ChartManageOrder } from "./data/ChartManageOrder";
import { ChartTrendLine } from "./data/ChartTrendLine";
import { ChartTrendLineType } from "./data/ChartTrendLineType";
import moment = require("moment");
import { PossibleTrade } from "../../../app/possibleTrades/data/PossibleTrade";

const _ = require("lodash");

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
};

type States = {
  candles: Candle[];
  numberOfCandles: number;
  nodata: boolean;
  secCode: string;
  innerInterval: Interval;
  innerStart: Date;
  enableTrendLine: boolean;
  enableNewOrder: boolean;
  needSave: boolean;
  showSRLevels: boolean;
  showSRZones: boolean;
  storeData: StoreData<TrendLineDto[]>;
  trendLines: TrendLineDto[];
  trends_1: ChartTrendLine[];
  startCalendarVisible: boolean;
};

export const CHART_MIN_WIDTH = 200;

export class ChartWrapper extends React.Component<Props, States> {
  private candlesSetupSubscription: SubscriptionLike = null;
  private wsStatusSub: SubscriptionLike = null;
  private fetchingCandles: boolean = false;
  private initialStateTrendLines: TrendLineDto[] = [];
  private chartTrendLineDefaultAppearance: ChartElementAppearance = {
    edgeFill: "#FFFFFF",
    edgeStroke: "#000000",
    edgeStrokeWidth: 1,
    r: 6,
    stroke: "#000000",
    strokeDasharray: "Solid",
    strokeOpacity: 1,
    strokeWidth: 1,
  };
  private wsCandleFilter: FilterDto;

  constructor(props) {
    super(props);
    const { interval, initialNumberOfCandles, start } = props;

    this.state = {
      candles: [],
      nodata: false,
      secCode: null,
      innerInterval: interval,
      innerStart: start,
      enableTrendLine: false,
      enableNewOrder: false,
      needSave: false,
      storeData: null,
      trendLines: [],
      trends_1: [],
      showSRLevels: true,
      showSRZones: true,
      numberOfCandles: initialNumberOfCandles || 500,
      startCalendarVisible: !!start,
    };
  }

  componentDidMount = () => {
    console.log("ChartWrapper: componentDidMount", this.props);
    // this.reinit();
  };

  componentWillUnmount = (): void => {
    console.log("ChartWrapper: componentWillUnmount", this.props);
    // this.cleanUp();
  };

  reinit = () => {
    this.candlesSetupSubscription = WebsocketService.getInstance()
      .on<Candle[]>(WSEvent.CANDLES)
      .subscribe((lastCandles) => {
        // console.log("lastCandles: ", lastCandles[0].interval)
        const { innerInterval, candles, trendLines } = this.state;
        if (
          candles.length > 2 &&
          lastCandles.length > 0 &&
          innerInterval === lastCandles[0].interval
        ) {
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
          // console.log('componentDidMount', lastCandles)

          if (needUpdateTrendLines) {
            this.setState({
              candles: newCandles,
              trends_1: this.mapTrendLinesFromPropsToState(
                trendLines,
                newCandles
              ),
            });
          } else {
            this.setState({ candles: newCandles });
          }
        }
      });

    this.wsStatusSub = WebsocketService.getInstance()
      .connectionStatus()
      .subscribe((isConnected) => {
        if (isConnected) {
          this.requestCandles(this.props.security);
        }
      });

    setTimeout(() => {
      const { numberOfCandles } = this.state;
      this.onNumberOfCandlesUpdated(numberOfCandles);
    }, 1000);
  };

  cleanUp = () => {
    if (this.candlesSetupSubscription)
      this.candlesSetupSubscription.unsubscribe();
    if (this.wsStatusSub) this.wsStatusSub.unsubscribe();
    if (this.wsCandleFilter) {
      WebsocketService.getInstance().send<FilterDto>(
        WSEvent.REMOVE_CANDLES,
        this.wsCandleFilter
      );
    }
  };

  componentDidUpdate = (prevProps: Props) => {
    const { security, interval, start } = this.props;
    const { candles, innerInterval, innerStart, numberOfCandles } = this.state;
    const isSecUpdated = !(
      (security &&
        prevProps.security &&
        security.id === prevProps.security.id) ||
      security == prevProps.security
    );

    if (security) {
      if (!this.fetchingCandles) {
        if (
          !prevProps.security ||
          candles.length === 0 ||
          security.secCode !== prevProps.security.secCode
        ) {
          this.fetchCandles(
            security,
            innerInterval,
            innerStart,
            numberOfCandles
          );
        }
        if (
          prevProps.security &&
          security.lastTradePrice !== prevProps.security.lastTradePrice
        ) {
          this.updateLastCandle();
        }
      }
    }

    if (interval !== innerInterval) {
      this.setState({ innerInterval: interval });
    }

    if (start !== innerStart) {
      this.setState({ innerStart: start });
    }

    if (isSecUpdated) {
      this.fetchTrendLines(interval);
      this.cleanUp();
      this.reinit();
    }
  };

  getNewCandles = (
    security: SecurityLastInfo,
    interval: Interval,
    start: Date,
    numberOfCandles: number
  ): Promise<Candle[]> => {
    const { history } = this.props;
    const { startCalendarVisible } = this.state;

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

  updateCandles = (candles: Candle[], security: SecurityLastInfo) => {
    // console.log('updateCandles', candles)
    if (candles && candles.length <= 1) {
      this.setState({
        candles: [],
        nodata: true,
      });
    } else {
      const { trendLines } = this.state;

      this.setState({
        candles,
        nodata: false,
        trends_1: this.mapTrendLinesFromPropsToState(trendLines, candles),
      });
      this.requestCandles(security);
    }
  };

  fetchCandles = (
    security: SecurityLastInfo,
    interval: Interval,
    start: Date,
    numberOfCandles: number
  ) => {
    if (security && !this.fetchingCandles) {
      let setIntervalIdForFetchCandles: NodeJS.Timeout = null;
      this.fetchingCandles = true;
      this.setState({
        candles: [],
      });

      this.getNewCandles(security, interval, start, numberOfCandles)
        .then((data) => {
          this.updateCandles(
            data.map((c) => {
              c.timestamp = new Date(c.timestamp);
              return c;
            }),
            security
          );
          this.fetchingCandles = false;
        })
        .catch((reason) => {
          this.fetchingCandles = false;
          this.fetchCandles(security, interval, start, numberOfCandles);
        });
    }
  };

  fetchTrendLines = (interval: Interval): void => {
    const { security } = this.props;
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
        .then(this.setTrendLinesFromServer)
        .catch((e) => console.error(e));
    }
  };

  setTrendLinesFromServer = (trendLinesFromServer: TrendLineDto[]): void => {
    const { candles, trendLines } = this.state;

    if (trendLines.length !== trendLinesFromServer.length) {
      for (const t of trendLinesFromServer) {
        t.startTimestamp = new Date(t.startTimestamp);
        t.endTimestamp = new Date(t.endTimestamp);
      }

      this.initialStateTrendLines = trendLinesFromServer;
      this.setState({
        trendLines: trendLinesFromServer,
        trends_1: this.mapTrendLinesFromPropsToState(
          trendLinesFromServer,
          candles
        ),
      });
    }
  };

  mapTrendLinesFromPropsToState = (
    trendLines: TrendLineDto[],
    candles: Candle[]
  ): ChartTrendLine[] => {
    const { innerInterval } = this.state;
    this.chartTrendLineDefaultAppearance.stroke =
      IntervalColor[innerInterval] || "#000000";
    this.chartTrendLineDefaultAppearance.edgeStroke =
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
          appearance: this.chartTrendLineDefaultAppearance,
          id: t.id,
        });
      }
    }
    return newTrends;
  };

  updateLastCandle = () => {
    const { security } = this.props;
    const { candles } = this.state;

    const lastCandle = candles[candles.length - 1];
    if (lastCandle) {
      if (security.lastTradePrice > lastCandle.high) {
        lastCandle.high = security.lastTradePrice;
      } else if (security.lastTradePrice < lastCandle.low) {
        lastCandle.low = security.lastTradePrice;
      }
      lastCandle.close = security.lastTradePrice;
      lastCandle.volume += security.lastTradeQuantity;
      this.setState({ candles: [...candles], nodata: false });
    }
  };

  requestCandles = (security: SecurityLastInfo): void => {
    const { innerInterval } = this.state;

    if (security && innerInterval) {
      this.wsCandleFilter = {
        brokerId:
          security.market === Market.SPB
            ? BrokerId.TINKOFF_INVEST
            : BrokerId.ALFA_DIRECT,
        tradingPlatform:
          security.market === Market.SPB
            ? TradingPlatform.API
            : TradingPlatform.QUIK,
        secId: security.id,
        interval: innerInterval,
        numberOfCandles: 2,
      };
      WebsocketService.getInstance().send<FilterDto>(
        WSEvent.GET_CANDLES,
        this.wsCandleFilter
      );
    }
  };

  getHighTimeFrameSRLevels = () => {
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

  private swingHighsLowsTimeFrameTradingIntervals = {
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

  getSwingHighsLowsMap = (): TrendWrapper[] => {
    const { premise, interval } = this.props;

    if (interval && premise && premise.analysis.trends) {
      const intervals: Interval[] = this
        .swingHighsLowsTimeFrameTradingIntervals[interval];
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

  getCandlePatternsUp = () => {
    const { alert } = this.props;

    let map = null;
    if (alert && alert.possibleFutureDirectionUp) {
      map = {};
      map[moment(alert.candle.timestamp).toDate().getTime()] = alert.candle.low;
    }

    return map;
  };

  getCandlePatternsDown = () => {
    const { alert } = this.props;

    let map = null;
    if (alert && !alert.possibleFutureDirectionUp) {
      map = {};
      map[moment(alert.candle.timestamp).toDate().getTime()] =
        alert.candle.high;
    }

    return map;
  };

  onIntervalUpdated = (e: any) => {
    const innerInterval: Interval = e.value;
    this.fetchTrendLines(innerInterval);
    this.setState({ innerInterval });

    const { security, onIntervalChanged } = this.props;
    const { innerStart, numberOfCandles } = this.state;

    onIntervalChanged(innerInterval);
    this.fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  onStartUpdated = (innerStart: Date) => {
    this.setState({ innerStart });

    const { security, onStartChanged } = this.props;
    const { innerInterval, numberOfCandles } = this.state;

    onStartChanged(innerStart);
    this.fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  onNumberOfCandlesUpdated = (numberOfCandles: number) => {
    const { security } = this.props;
    const { innerInterval, innerStart } = this.state;

    this.setState({ numberOfCandles });

    this.fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  onNumberOfCandlesUpdatedWrapper = (e: any) => {
    this.onNumberOfCandlesUpdated(e.target["value"]);
  };

  onEnableTrendLine = (enableTrendLine: boolean) => {
    this.setState({ enableTrendLine });
  };

  onEnableTrendLineWrapper = (e: any) => {
    this.onEnableTrendLine(e.value);
  };

  onEnableNewOrder = (enableNewOrder: boolean) => {
    this.setState({ enableNewOrder });
  };

  onEnableNewOrderWrapper = (e: any) => {
    this.onEnableNewOrder(e.value);
  };

  onSave = () => {
    const { security } = this.props;
    const { storeData } = this.state;
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
          .then(this.setTrendLinesFromServer)
          .catch(console.error);
      }
    }
    this.setState({ needSave: false });
  };

  onCancel = () => {
    const { candles } = this.state;

    this.setState({
      needSave: false,
      storeData: null,
      trendLines: this.initialStateTrendLines,
      trends_1: this.mapTrendLinesFromPropsToState(
        this.initialStateTrendLines,
        candles
      ),
    });
  };

  onNeedSave = (storeData: StoreData<TrendLineDto[]>): void => {
    const { candles } = this.state;

    const newTrendLines = [];
    if (storeData.save && storeData.save.length > 0) {
      for (const trendLine of storeData.save) {
        newTrendLines.push(trendLine);
      }
    }

    this.setState({
      storeData,
      needSave: true,
      trendLines: newTrendLines,
      trends_1: this.mapTrendLinesFromPropsToState(newTrendLines, candles),
    });
  };

  showStartCalendar = () => {
    const { security } = this.props;
    const { startCalendarVisible, numberOfCandles, innerInterval } = this.state;

    const newStartCalendarVisible = !startCalendarVisible;
    const innerStart = newStartCalendarVisible
      ? moment().subtract(1, "days").hours(9).minutes(0).seconds(0).toDate()
      : null;

    this.setState({
      startCalendarVisible: newStartCalendarVisible,
      innerStart,
    });

    this.fetchCandles(security, innerInterval, innerStart, numberOfCandles);
  };

  getSRLevels = () => {
    const { innerInterval, showSRLevels } = this.state;
    const { premise } = this.props;

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

  manageOrder = (order: ChartManageOrder) => {
    const { history } = this.props;

    if (order.type === "order") {
      if (order.cancelOrder) {
        WebsocketService.getInstance().send(
          history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS,
          [order.cancelOrder]
        );
      }
      if (order.createOrder) {
        WebsocketService.getInstance().send(
          history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS,
          [order.createOrder]
        );
      }
    } else {
      if (order.cancelStopOrder) {
        WebsocketService.getInstance().send(
          history
            ? WSEvent.HISTORY_CANCEL_STOP_ORDERS
            : WSEvent.CANCEL_STOP_ORDERS,
          [order.cancelStopOrder]
        );
      }
      if (order.createStopOrder) {
        WebsocketService.getInstance().send(
          history
            ? WSEvent.HISTORY_CREATE_STOP_ORDERS
            : WSEvent.CREATE_STOP_ORDERS,
          [order.createStopOrder]
        );
      }
    }
  };

  updateShowSRZones = (e: any) => this.setState({ showSRZones: e.value });
  updateShowSRLevels = (e: any) => this.setState({ showSRLevels: e.value });

  render() {
    const {
      candles,
      nodata,
      innerInterval,
      innerStart,
      enableTrendLine,
      enableNewOrder,
      needSave,
      trends_1,
      showSRLevels,
      showSRZones,
      numberOfCandles,
      startCalendarVisible,
    } = this.state;

    const {
      width,
      chartHeight,
      showGrid,
      premise,
      security,
      trades,
      orders,
      stops,
      activeTrade,
      onPremiseBeforeChanged,
      possibleTrade,
    } = this.props;

    if (!security) {
      return <>Select security for chart</>;
    }

    return (
      <>
        <ChartWrapperHead
          security={security}
          innerInterval={innerInterval}
          onIntervalUpdated={this.onIntervalUpdated}
          numberOfCandles={numberOfCandles}
          onNumberOfCandlesUpdatedWrapper={this.onNumberOfCandlesUpdatedWrapper}
          startCalendarVisible={startCalendarVisible}
          showStartCalendar={this.showStartCalendar}
          innerStart={innerStart}
          onStartUpdated={this.onStartUpdated}
          onPremiseBeforeChanged={onPremiseBeforeChanged}
          enableNewOrder={enableNewOrder}
          onEnableNewOrderWrapper={this.onEnableNewOrderWrapper}
          enableTrendLine={enableTrendLine}
          onEnableTrendLineWrapper={this.onEnableTrendLineWrapper}
          needSave={needSave}
          onSave={this.onSave}
          onCancel={this.onCancel}
          showSRLevels={showSRLevels}
          updateShowSRLevels={this.updateShowSRLevels}
          showSRZones={showSRZones}
          updateShowSRZones={this.updateShowSRZones}
        />
        {candles.length > 0 ? (
          <CandleStickChartForDiscontinuousIntraDay
            type={ChartDrawType.CANVAS_SVG}
            data={candles}
            width={width}
            chartHeight={chartHeight}
            ratio={1}
            htSRLevels={this.getHighTimeFrameSRLevels()}
            stops={stops}
            orders={orders}
            onManageOrder={this.manageOrder}
            trades={trades}
            activeTrade={activeTrade}
            swingHighsLows={this.getSwingHighsLowsMap()}
            showGrid={showGrid}
            zones={premise && showSRZones ? premise.analysis.srZones : null}
            srLevels={this.getSRLevels()}
            candlePatternsUp={this.getCandlePatternsUp()}
            candlePatternsDown={this.getCandlePatternsDown()}
            securityInfo={security}
            enableTrendLine={enableTrendLine}
            onEnableTrendLine={this.onEnableTrendLine}
            enableNewOrder={enableNewOrder}
            onEnableNewOrder={this.onEnableNewOrder}
            needSave={this.onNeedSave}
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
}
