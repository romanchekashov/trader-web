import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ChartWrapper } from "../../../common/components/chart/ChartWrapper";
import { Interval } from "../../../common/data/Interval";
import { getTradePremise } from "../../../common/api/rest/analysisRestApi";
import { TrendsView } from "../../../common/components/trend/TrendsView";
import { TradingPlatform } from "../../../common/data/trading/TradingPlatform";
import { Dropdown } from "primereact/dropdown";
import { PrimeDropdownItem } from "../../../common/utils/utils";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Notifications from "../../../common/components/notifications/Notifications";
import {
  WebsocketService,
  WSEvent,
} from "../../../common/api/WebsocketService";
import { SecurityLastInfo } from "../../../common/data/security/SecurityLastInfo";
import { TradePremise } from "../../../common/data/strategy/TradePremise";
import { Order } from "../../../common/data/Order";
import { ActiveTrade } from "../../../common/data/ActiveTrade";
import Alerts from "../../../common/components/alerts/Alerts";
import MarketState from "../../../common/components/market-state/MarketState";
import SwingStateList from "../../../common/components/swing-state/SwingStateList";
import { adjustTradePremise } from "../../../common/utils/DataUtils";
import { MoexOpenInterestView } from "./moex-open-interest/MoexOpenInterestView";
import { Trade } from "../../../common/data/Trade";
import { TabPanel, TabView } from "primereact/tabview";
import { EconomicCalendar } from "../../../common/components/economic-calendar/EconomicCalendar";
import { News } from "../../../common/components/news/News";
import { StopOrder } from "../../../common/data/StopOrder";
import { getTrades } from "../../../common/api/rest/quikRestApi";
import { BrokerId } from "../../../common/data/BrokerId";
import { MarketStateFilterDto } from "../../../common/components/market-state/data/MarketStateFilterDto";
import { Market } from "../../../common/data/Market";
import { TradeStrategyAnalysisFilterDto } from "../../../common/data/TradeStrategyAnalysisFilterDto";
import { FilterDto } from "../../../common/data/FilterDto";
import { SupplyAndDemand } from "./supply-and-demand/SupplyAndDemand";
import {
  getTimeFrameHigh,
  getTimeFrameLow,
} from "../../../common/utils/TimeFrameChooser";
import moment = require("moment");
import { Toast } from "primereact/toast";
import TestData from "../../../common/utils/TestData";
import { useAppSelector } from "../../../app/hooks";
import { selectPossibleTrade } from "../../../app/possibleTrades/possibleTradesSlice";
import { PossibleTrade } from "../../../app/possibleTrades/data/PossibleTrade";

type Props = {
  security: SecurityLastInfo;
};

let prevMainWidth;

const AnalysisFutures: React.FC<Props> = ({ security }) => {
  const { possibleTrade } = useAppSelector(selectPossibleTrade);

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
  const MIN_CHART_WIDTH = 400;
  const toast = useRef(null);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const [start, setStart] = useState(
    moment().subtract(1, "days").hours(9).minutes(0).seconds(0).toDate()
  );
  const [premiseBefore, setPremiseBefore] = useState<Date>(null);

  const [timeFrameTrading, setTimeFrameTrading] = useState<Interval>(
    Interval.M3
  );
  const [timeFrameMin, setTimeFrameMin] = useState<Interval>(Interval.M1);
  const [timeFrameHigh, setTimeFrameHigh] = useState<Interval>(Interval.M30);
  const [premise, setPremise] = useState<TradePremise>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stopOrders, setStopOrders] = useState<StopOrder[]>([]);
  const [activeTrade, setActiveTrade] = useState(null);

  const chartNumbers: PrimeDropdownItem<number>[] = [1, 2].map((val) => ({
    label: "" + val,
    value: val,
  }));
  const [chartNumber, setChartNumber] = useState<number>(2);

  const [securityLastInfo, setSecurityLastInfo] = useState<SecurityLastInfo>(
    null
  );
  const [chart1Width, setChart1Width] = useState(MIN_CHART_WIDTH);
  const [chart2Width, setChart2Width] = useState(MIN_CHART_WIDTH);
  const [chartAlertsWidth, setChartAlertsWidth] = useState(MIN_CHART_WIDTH);
  const mainRef = useRef(null);
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chartAlertsRef = useRef(null);
  const [trendLowTF, setTrendLowTF] = useState(null);
  const [filterDto, setFilterDto] = useState<FilterDto>(null);
  const [marketStateFilterDto, setMarketStateFilterDto] = useState(null);
  const [alert, setAlert] = useState(null);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    if (prevMainWidth && prevMainWidth !== mainRef?.current?.clientWidth) {
      updateSize();
    }
    prevMainWidth = mainRef?.current?.clientWidth;
  });

  const updateSize = () => {
    setChart1Width(
      chart1Ref.current ? chart1Ref.current.clientWidth : MIN_CHART_WIDTH
    );
    setChart2Width(
      chart2Ref.current ? chart2Ref.current.clientWidth : MIN_CHART_WIDTH
    );
    setChartAlertsWidth(
      chartAlertsRef.current
        ? chartAlertsRef.current.clientWidth
        : MIN_CHART_WIDTH
    );
  };

  useEffect(() => {
    console.log("orders: ", orders);

    const ordersSetupSubscription = WebsocketService.getInstance()
      .on<Order[]>(WSEvent.ORDERS)
      .subscribe((newOrders) => {
        if (orders.length !== newOrders.length) {
          setOrders(newOrders);
        }
      });

    // Specify how to clean up after this effect:
    return function cleanup() {
      ordersSetupSubscription.unsubscribe();
    };
  }, [orders]);

  useEffect(() => {
    console.log("stopOrders: ", stopOrders);

    const stopOrdersSubscription = WebsocketService.getInstance()
      .on<StopOrder[]>(WSEvent.STOP_ORDERS)
      .subscribe((newStopOrders) => {
        console.log(newStopOrders);
        if (stopOrders.length !== newStopOrders.length) {
          setStopOrders(newStopOrders);
        }
      });

    // Specify how to clean up after this effect:
    return function cleanup() {
      stopOrdersSubscription.unsubscribe();
    };
  }, [stopOrders]);

  useEffect(() => {
    if (security) {
      console.log("AnalysisFutures: ", security);
      informServerAboutRequiredData();

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

      // updateMarketStateFilterDto(timeFrameTrading)

      fetchPremise(timeFrameTrading);

      getTrades(40).then(setTrades);

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

    const activeTradeSubscription = WebsocketService.getInstance()
      .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES)
      .subscribe((activeTrades) => {
        if (security) {
          const activeTrade = activeTrades.find(
            (at) => at && at.secId === security.id
          );
          setActiveTrade(activeTrade);
        }
      });

    setTimeout(updateSize, 1000);
    window.addEventListener("resize", updateSize);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", updateSize);
      wsStatusSub.unsubscribe();
      lastSecuritiesSubscription.unsubscribe();
      activeTradeSubscription.unsubscribe();
    };
  }, [security]);

  useEffect(() => {
    const tradePremiseSubscription = WebsocketService.getInstance()
      .on<TradePremise>(WSEvent.TRADE_PREMISE)
      .subscribe((newPremise) => {
        if (!premiseBefore) {
          adjustTradePremise(newPremise);
          setPremise(newPremise);
        }
      });

    // Specify how to clean up after this effect:
    return function cleanup() {
      tradePremiseSubscription.unsubscribe();
    };
  }, [security, premiseBefore]);

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
    let attempts = 3;
    const load = () => {
      attempts--;
      getTradePremise({
        brokerId: BrokerId.ALFA_DIRECT,
        tradingPlatform: TradingPlatform.QUIK,
        secId: security.id,
        timeFrameTrading,
        timeFrameMin,
        timestamp: before,
      })
        .then(setPremise)
        .catch((reason) => {
          toast.current.show({
            severity: "error",
            summary: "Error Message",
            detail: reason.message,
            life: 3000,
          });

          if (0 < attempts) load();
        });
    };
    load();
  };

  const onChartNumberChanged = (num: number) => {
    setChartNumber(num);
    setTimeout(updateSize, 1000);
  };

  const onTradingIntervalChanged = (interval: Interval) => {
    setTimeFrameTrading(interval);
    setTimeFrameHigh(getTimeFrameHigh(interval));
    setTimeFrameMin(getTimeFrameLow(interval));
    fetchPremise(interval);
    // updateMarketStateFilterDto(interval)
  };

  const onStartChanged = (start: Date) => {
    setStart(start);
  };

  const onPremiseBeforeChanged = (before: Date) => {
    setPremiseBefore(before);
    fetchPremise(timeFrameTrading, before);
  };

  const onTabChanged = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        break;
      case 1:
        break;
      case 2:
        break;
      case 3:
        break;
    }

    setActiveTabIndex(tabIndex);
  };

  if (!security) return <div>Select security for analysis</div>;

  const pTrade: PossibleTrade =
    security && security.id === possibleTrade?.secId && possibleTrade;

  return (
    <div className="p-grid" ref={mainRef}>
      <Toast ref={toast} />
      <div className="p-col-12">
        <div className="p-grid analysis-head">
          <div className="p-col-12">
            <div className="analysis-head-chart-number">
              <Dropdown
                value={chartNumber}
                options={chartNumbers}
                onChange={(e) => onChartNumberChanged(e.value)}
              />
            </div>
          </div>
          <div className="p-col-12">
            <DataTable value={[securityLastInfo]}>
              <Column field="totalDemand" header="Общ спрос" />
              <Column field="totalSupply" header="Общ предл" />
              <Column field="futureSellDepoPerContract" header="ГО прод" />
              <Column field="futureBuyDepoPerContract" header="ГО покуп" />
              <Column field="lastTradePrice" header="Цена" />
              <Column field="numTradesToday" header="Кол-во сделок" />
            </DataTable>
          </div>
        </div>
        <TrendsView trends={premise ? premise.analysis.trends : []} />
        <div className="p-grid" style={{ margin: "0" }}>
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
              stops={stopOrders}
              orders={orders}
              trades={trades}
              activeTrade={activeTrade}
              showGrid={true}
              possibleTrade={pTrade}
            />
          </div>
          {chartNumber === 2 ? (
            <div className="p-col-6" ref={chart2Ref} style={{ padding: "0" }}>
              <ChartWrapper
                interval={timeFrameHigh}
                // start={start}
                initialNumberOfCandles={500}
                onIntervalChanged={(interval) => {}}
                onStartChanged={(start) => {}}
                width={chart2Width}
                security={securityLastInfo}
                premise={premise}
                trades={trades}
                showGrid={true}
                possibleTrade={pTrade}
              />
            </div>
          ) : null}
        </div>
        <div className="p-grid">
          {/* <div className="p-col-12">
                        <MarketState filter={marketStateFilterDto}/>
                    </div>
                    <div className="p-col-12">
                        <SwingStateList filter={marketStateFilterDto}/>
                    </div> */}
          <div className="p-col-12">
            <SupplyAndDemand security={securityLastInfo} />
          </div>
          <div className="p-col-12">
            <div className="p-grid">
              <div className="p-col-4">
                <Notifications
                  filter={filterDto}
                  security={securityLastInfo}
                  onNotificationSelected={(n) => {
                    console.log(n);
                  }}
                  viewHeight={400}
                />
              </div>
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
                start={start}
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
        <TabView
          activeIndex={activeTabIndex}
          onTabChange={(e) => onTabChanged(e.index)}
        >
          <TabPanel header="Open Interest">
            <MoexOpenInterestView security={security} />
          </TabPanel>
          <TabPanel header="News">
            <News secId={security.id} />
          </TabPanel>
          <TabPanel header="Calendar">
            <EconomicCalendar secId={security.id} />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
};

export default AnalysisFutures;
