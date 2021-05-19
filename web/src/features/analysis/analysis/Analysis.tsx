import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { TabPanel, TabView } from "primereact/tabview";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { getTradePremise } from "../../../common/api/rest/analysisRestApi";
import {
  WebsocketService,
  WSEvent,
} from "../../../common/api/WebsocketService";
import Alerts from "../../../common/components/alerts/Alerts";
import {
  ChartWrapper,
  CHART_MIN_WIDTH,
} from "../../../common/components/chart/ChartWrapper";
import { EconomicCalendar } from "../../../common/components/economic-calendar/EconomicCalendar";
import { MarketStateFilterDto } from "../../../common/components/market-state/data/MarketStateFilterDto";
import MarketState from "../../../common/components/market-state/MarketState";
import { News } from "../../../common/components/news/News";
import Notifications from "../../../common/components/notifications/Notifications";
import { SecurityShareEventView } from "../../../common/components/share-event/SecurityShareEventView";
import SwingStateList from "../../../common/components/swing-state/SwingStateList";
import { TrendsView } from "../../../common/components/trend/TrendsView";
import TrendViewCharts from "../../../common/components/trend/TrendViewCharts/TrendViewCharts";
import { ActiveTrade } from "../../../common/data/ActiveTrade";
import { BrokerId } from "../../../common/data/BrokerId";
import { ClassCode } from "../../../common/data/ClassCode";
import { FilterDto } from "../../../common/data/FilterDto";
import { Interval } from "../../../common/data/Interval";
import { Market } from "../../../common/data/Market";
import { Order } from "../../../common/data/Order";
import { SecurityLastInfo } from "../../../common/data/security/SecurityLastInfo";
import { TradePremise } from "../../../common/data/strategy/TradePremise";
import { TradeStrategyAnalysisFilterDto } from "../../../common/data/TradeStrategyAnalysisFilterDto";
import { TradingPlatform } from "../../../common/data/trading/TradingPlatform";
import { adjustTradePremise } from "../../../common/utils/DataUtils";
import {
  getTimeFrameHigh,
  getTimeFrameLow,
} from "../../../common/utils/TimeFrameChooser";
import moment = require("moment");

export interface AnalysisState {
  realDepo: boolean;
}

type Props = {
  security: SecurityLastInfo;
  chartNumber: number;
};

const Analysis: React.FC<Props> = ({ security, chartNumber }) => {
  const timeFrameTradingIntervals = {
    M1: [Interval.M1],
    M3: [Interval.M3, Interval.M1],
    M5: [Interval.M5, Interval.M1],
    M15: [Interval.M15, Interval.M3],
    M30: [Interval.M30, Interval.M5],
    M60: [Interval.M60, Interval.M15],
    H2: [Interval.H2, Interval.M30],
    H4: [Interval.H4, Interval.M60],
    DAY: [Interval.DAY, Interval.H2],
    WEEK: [Interval.WEEK, Interval.DAY],
    MONTH: [Interval.MONTH, Interval.WEEK],
  };
  const mainRef = useRef(null);
  const [start, setStart] = useState(
    moment().subtract(1, "days").hours(9).minutes(0).seconds(0).toDate()
  );
  const [timeFrameTrading, setTimeFrameTrading] = useState<Interval>(
    Interval.M60
  );
  const [timeFrameMin, setTimeFrameMin] = useState<Interval>(Interval.M5);
  const [timeFrameHigh, setTimeFrameHigh] = useState<Interval>(Interval.DAY);
  const [premise, setPremise] = useState(null);
  const [orders, setOrders] = useState(null);
  const [activeTrade, setActiveTrade] = useState(null);
  const [premiseBefore, setPremiseBefore] = useState<Date>(null);

  const [securityLastInfo, setSecurityLastInfo] =
    useState<SecurityLastInfo>(null);
  const [chart1Width, setChart1Width] = useState(CHART_MIN_WIDTH);
  const [chart2Width, setChart2Width] = useState(CHART_MIN_WIDTH);
  const [chartAlertsWidth, setChartAlertsWidth] = useState(CHART_MIN_WIDTH);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chartAlertsRef = useRef(null);
  const [trendLowTF, setTrendLowTF] = useState(null);
  const [filterDto, setFilterDto] = useState<FilterDto>(null);
  const [marketStateFilterDto, setMarketStateFilterDto] =
    useState<MarketStateFilterDto>(null);
  const [alert, setAlert] = useState(null);

  const updateSize = () => {
    setChart1Width(
      chart1Ref.current ? chart1Ref.current.clientWidth : CHART_MIN_WIDTH
    );
    setChart2Width(
      chart2Ref.current ? chart2Ref.current.clientWidth : CHART_MIN_WIDTH
    );
    setChartAlertsWidth(
      chartAlertsRef.current
        ? chartAlertsRef.current.clientWidth
        : CHART_MIN_WIDTH
    );
  };

  useEffect(() => {
    if (security) {
      console.log("Analysis: ", security);
      informServerAboutRequiredData();

      // if (!trendLowTF && !trendLowTFLoading) {
      //     trendLowTFLoading = true;
      //     getTrend(future.classCode, future.secCode, timeFrameLow, 540)
      //         .then(trend => {
      //             setTrendLowTF(trend);
      //             trendLowTFLoading = false;
      //         })
      //         .catch(reason => {
      //             trendLowTFLoading = false;
      //         });
      // }
      //
      if (!filterDto || filterDto.secId !== security.id) {
        setFilterDto({
          brokerId:
            security.market === Market.SPB
              ? BrokerId.TINKOFF_INVEST
              : BrokerId.ALFA_DIRECT,
          tradingPlatform:
            security.market === Market.SPB
              ? TradingPlatform.API
              : TradingPlatform.QUIK,
          secId: security.id,
          fetchByWS: true,
          history: false,
          all: false,
        });
      }
      updateMarketStateFilterDto(timeFrameTrading);

      fetchPremise(timeFrameTrading);

      setSecurityLastInfo(security);
    }

    const wsStatusSub = WebsocketService.getInstance()
      .connectionStatus()
      .subscribe((isConnected) => {
        if (isConnected && security) {
          informServerAboutRequiredData();
        }
      });

    const lastSecuritiesSubscription = WebsocketService.getInstance()
      .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
      .subscribe((securities) => {
        if (security) {
          const newSecurityLastInfo = securities.find(
            (o) => o.secCode === security.secCode
          );
          if (newSecurityLastInfo) {
            newSecurityLastInfo.lastTradeTime = new Date(
              newSecurityLastInfo.lastTradeTime
            );
            setSecurityLastInfo(newSecurityLastInfo);
          }
        }
      });

    const tradePremiseSubscription = WebsocketService.getInstance()
      .on<TradePremise>(WSEvent.TRADE_PREMISE)
      .subscribe((newPremise) => {
        adjustTradePremise(newPremise);
        setPremise(newPremise);
      });

    const ordersSetupSubscription = WebsocketService.getInstance()
      .on<Order[]>(WSEvent.ORDERS)
      .subscribe(setOrders);

    const activeTradeSubscription = WebsocketService.getInstance()
      .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES)
      .subscribe((activeTrades) => {
        if (securityLastInfo) {
          const activeTrade = activeTrades.find(
            (at) => at && at.secId === securityLastInfo.id
          );
          setActiveTrade(activeTrade);
        }
      });

    setTimeout(updateSize, 1000);
    window.addEventListener("resize", updateSize);

    return function cleanup() {
      window.removeEventListener("resize", updateSize);
      wsStatusSub.unsubscribe();
      lastSecuritiesSubscription.unsubscribe();
      tradePremiseSubscription.unsubscribe();
      ordersSetupSubscription.unsubscribe();
      activeTradeSubscription.unsubscribe();
    };
  }, [security]);

  const updateMarketStateFilterDto = (interval: Interval) => {
    const marketStateFilter: MarketStateFilterDto = {
      brokerId:
        security.market === Market.SPB
          ? BrokerId.TINKOFF_INVEST
          : BrokerId.ALFA_DIRECT,
      tradingPlatform:
        security.market === Market.SPB
          ? TradingPlatform.API
          : TradingPlatform.QUIK,
      secId: security.id,
      intervals: timeFrameTradingIntervals[interval],
      fetchByWS: true,
      // history: false,
      numberOfCandles: 100,
    };

    setMarketStateFilterDto(marketStateFilter);
    WebsocketService.getInstance().send<MarketStateFilterDto>(
      WSEvent.GET_MARKET_STATE,
      marketStateFilter
    );
  };

  const informServerAboutRequiredData = (): void => {
    if (security) {
      WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(
        WSEvent.GET_TRADE_PREMISE_AND_SETUP,
        {
          brokerId:
            security.market === Market.SPB
              ? BrokerId.TINKOFF_INVEST
              : BrokerId.ALFA_DIRECT,
          tradingPlatform:
            security.market === Market.SPB
              ? TradingPlatform.API
              : TradingPlatform.QUIK,
          secId: security.id,
          timeFrameTrading: Interval.M5,
          timeFrameMin: Interval.M1,
        }
      );
      WebsocketService.getInstance().send<string>(
        WSEvent.GET_TRADES_AND_ORDERS,
        security.secCode
      );
      WebsocketService.getInstance().send<MarketStateFilterDto>(
        WSEvent.GET_MARKET_STATE,
        {
          brokerId:
            security.market === Market.SPB
              ? BrokerId.TINKOFF_INVEST
              : BrokerId.ALFA_DIRECT,
          tradingPlatform:
            security.market === Market.SPB
              ? TradingPlatform.API
              : TradingPlatform.QUIK,
          secId: security.id,
          intervals: timeFrameTradingIntervals[timeFrameTrading],
          fetchByWS: true,
          // history: false,
          numberOfCandles: 100,
        }
      );
    }
  };

  const fetchPremise = (timeFrameTrading: Interval, before?: Date) => {
    getTradePremise({
      brokerId:
        security.market === Market.SPB
          ? BrokerId.TINKOFF_INVEST
          : BrokerId.ALFA_DIRECT,
      tradingPlatform:
        security.market === Market.SPB
          ? TradingPlatform.API
          : TradingPlatform.QUIK,
      secId: security.id,
      timeFrameTrading,
      timeFrameMin,
      timestamp: before,
    })
      .then(setPremise)
      .catch((reason) => {
        fetchPremise(timeFrameTrading);
      });
  };

  const onTradingIntervalChanged = (interval: Interval) => {
    setTimeFrameTrading(interval);
    setTimeFrameHigh(getTimeFrameHigh(interval));
    setTimeFrameMin(getTimeFrameLow(interval));
    fetchPremise(interval);
    updateMarketStateFilterDto(interval);
  };

  const onStartChanged = (start: Date) => {
    setStart(start);
  };

  const onPremiseBeforeChanged = (before: Date) => {
    setPremiseBefore(before);
    fetchPremise(timeFrameTrading, before);
  };

  if (security) {
    return (
      <div className="p-grid" ref={mainRef}>
        <div className="p-col-12">
          <div className="p-grid" style={{ margin: "0" }}>
            <div className="p-col-6" ref={chart2Ref} style={{ padding: "0" }}>
              <ChartWrapper
                interval={timeFrameHigh}
                initialNumberOfCandles={500}
                onIntervalChanged={(interval) => {}}
                onStartChanged={(start) => {}}
                width={chart2Width}
                security={securityLastInfo}
                premise={premise}
                showGrid={true}
              />
            </div>
            {chartNumber === 2 ? (
              <div className="p-col-6" ref={chart1Ref} style={{ padding: "0" }}>
                <ChartWrapper
                  interval={timeFrameTrading}
                  initialNumberOfCandles={500}
                  onIntervalChanged={onTradingIntervalChanged}
                  onStartChanged={onStartChanged}
                  onPremiseBeforeChanged={onPremiseBeforeChanged}
                  width={chart1Width}
                  security={securityLastInfo}
                  premise={premise}
                  orders={orders}
                  activeTrade={activeTrade}
                  showGrid={true}
                />
              </div>
            ) : null}
          </div>

          <TrendsView trends={premise ? premise.analysis.trends : []} />
          <TrendViewCharts premise={premise} security={securityLastInfo} />

          <div className="p-grid">
            <div className="p-col-12">
              <MarketState filter={marketStateFilterDto} />
            </div>
            <div className="p-col-12">
              <SwingStateList filter={marketStateFilterDto} />
            </div>
            <div className="p-col-12">
              <div className="p-grid">
                <div className="p-col-4">
                  <Alerts
                    filter={filterDto}
                    onAlertSelected={(n) => {
                      console.log(n);
                    }}
                    alertsHeight={400}
                  />
                </div>
              </div>
            </div>
            <div
              className="p-col-12"
              ref={chartAlertsRef}
              style={{ padding: "0" }}
            >
              {alert ? (
                <ChartWrapper
                  interval={alert.interval}
                  onIntervalChanged={(interval) => {}}
                  onStartChanged={(start) => {}}
                  alert={alert}
                  width={chartAlertsWidth}
                  security={securityLastInfo}
                  premise={premise}
                  showGrid={true}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="p-col-12">
          <TabView>
            <TabPanel header="Events">
              {security.classCode === ClassCode.TQBR ? (
                <SecurityShareEventView secCode={security.secCode} />
              ) : null}
            </TabPanel>
            <TabPanel header="News">
              <News secId={security.id} />
            </TabPanel>
            <TabPanel header="Calendar">
              {ClassCode.CETS === security.classCode ? (
                <EconomicCalendar secId={security.id} />
              ) : null}
            </TabPanel>
          </TabView>
        </div>
      </div>
    );
  } else {
    return <div>Select security for analysis</div>;
  }
};

export default Analysis;
