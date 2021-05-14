import { Dropdown } from "primereact/dropdown";
import { TabPanel, TabView } from "primereact/tabview";
import { Toast } from "primereact/toast";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { selectActiveTrades } from "../../../app/activeTrades/activeTradesSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { PossibleTrade } from "../../../app/possibleTrades/data/PossibleTrade";
import {
  selectPossibleTrade,
  tradePossibleTrade,
} from "../../../app/possibleTrades/possibleTradesSlice";
import { selectSecurities } from "../../../app/securities/securitiesSlice";
import {
  createStop,
  deleteStop,
  selectStops,
} from "../../../app/stops/stopsSlice";
import { getTrades } from "../../../common/api/quik/quikRestApi";
import { getTradePremise } from "../../../common/api/rest/analysisRestApi";
import {
  WebsocketService,
  WSEvent,
} from "../../../common/api/WebsocketService";
import { ChartWrapper } from "../../../common/components/chart/ChartWrapper";
import { ChartManageOrder } from "../../../common/components/chart/data/ChartManageOrder";
import { EconomicCalendar } from "../../../common/components/economic-calendar/EconomicCalendar";
import { MarketStateFilterDto } from "../../../common/components/market-state/data/MarketStateFilterDto";
import { News } from "../../../common/components/news/News";
import { TrendsView } from "../../../common/components/trend/TrendsView";
import TrendViewCharts from "../../../common/components/trend/TrendViewCharts/TrendViewCharts";
import { BrokerId } from "../../../common/data/BrokerId";
import { CrudMode } from "../../../common/data/CrudMode";
import { DataType } from "../../../common/data/DataType";
import { FilterDto } from "../../../common/data/FilterDto";
import { Interval } from "../../../common/data/Interval";
import { Market } from "../../../common/data/Market";
import { Order } from "../../../common/data/Order";
import { SecurityLastInfo } from "../../../common/data/security/SecurityLastInfo";
import { TradePremise } from "../../../common/data/strategy/TradePremise";
import { Trade } from "../../../common/data/Trade";
import { TradeStrategyAnalysisFilterDto } from "../../../common/data/TradeStrategyAnalysisFilterDto";
import { TradingPlatform } from "../../../common/data/trading/TradingPlatform";
import { adjustTradePremise } from "../../../common/utils/DataUtils";
import {
  getTimeFrameHigh,
  getTimeFrameLow,
} from "../../../common/utils/TimeFrameChooser";
import { PrimeDropdownItem } from "../../../common/utils/utils";
import { MoexOpenInterestView } from "./moex-open-interest/MoexOpenInterestView";
import moment = require("moment");

type Props = {
  security: SecurityLastInfo;
};

let prevMainWidth;

const AnalysisFutures: React.FC<Props> = ({ security }) => {
  const dispatch = useAppDispatch();
  const { possibleTrade } = useAppSelector(selectPossibleTrade);
  const { securities } = useAppSelector(selectSecurities);
  const { stops } = useAppSelector(selectStops);
  const { activeTrades } = useAppSelector(selectActiveTrades);

  const securityLastInfo =
    securities?.find((o) => o.id === security.id) || security;

  const activeTrade = activeTrades.find(({ secId }) => secId === security.id);

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

  const chartNumbers: PrimeDropdownItem<number>[] = [1, 2].map((val) => ({
    label: "" + val,
    value: val,
  }));
  const [chartNumber, setChartNumber] = useState<number>(2);

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
    }

    const wsStatusSub = WebsocketService.getInstance()
      .connectionStatus()
      .subscribe((isConnected) => {
        if (isConnected && security) {
          informServerAboutRequiredData();
        }
      });

    setTimeout(updateSize, 1000);
    window.addEventListener("resize", updateSize);

    // Specify how to clean up after this effect:
    return function cleanup() {
      window.removeEventListener("resize", updateSize);
      wsStatusSub.unsubscribe();
    };
  }, [security?.id]);

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

  const manageOrder = (order: ChartManageOrder) => {
    console.log("manageOrder: ", order);
    if (order.dataType === DataType.ORDER) {
      if (order.action === CrudMode.DELETE) {
        WebsocketService.getInstance().send(
          history ? WSEvent.HISTORY_CANCEL_ORDERS : WSEvent.CANCEL_ORDERS,
          [order.data]
        );
      }
      if (order.action === CrudMode.CREATE) {
        WebsocketService.getInstance().send(
          history ? WSEvent.HISTORY_CREATE_ORDERS : WSEvent.CREATE_ORDERS,
          [order.data]
        );
      }
    }

    if (order.dataType === DataType.STOP_ORDER) {
      if (order.action === CrudMode.DELETE)
        dispatch(deleteStop(order.data.number));
      if (order.action === CrudMode.CREATE) dispatch(createStop(order.data));
    }

    if (order.dataType === DataType.POSSIBLE_TRADE) {
      const possibleTrade: PossibleTrade = order.data;
      dispatch(
        tradePossibleTrade({
          brokerId: BrokerId.ALFA_DIRECT,
          tradingPlatform: TradingPlatform.QUIK,
          secId: security.id,
          timeFrame: possibleTrade.timeFrame,
          timeFrameLow: possibleTrade.timeFrameLow,
          entryPrice: possibleTrade.entryPrice,
          quantity: possibleTrade.quantity,
          operation: possibleTrade.operation,
          depositAmount: 0,
          depositMaxRiskPerTradeInPercent: 1,
        })
      );
    }
  };

  if (!security) return <div>Select security for analysis</div>;

  const pTrade: PossibleTrade =
    security && security.id === possibleTrade?.secId && possibleTrade;

  return (
    <div className="p-grid" ref={mainRef}>
      <Toast ref={toast} />
      <div className="p-col-12">
        <div className="p-grid analysis-head">
          <div className="p-col-1">
            <div className="analysis-head-chart-number">
              <Dropdown
                value={chartNumber}
                options={chartNumbers}
                onChange={(e) => onChartNumberChanged(e.value)}
              />
            </div>
          </div>
          <div className="p-col-11">
            <TrendsView trends={premise ? premise.analysis.trends : []} />
          </div>
        </div>
        <div className="p-grid" style={{ margin: "0" }}>
          <div className="p-col-6" ref={chart1Ref} style={{ padding: "0" }}>
            <ChartWrapper
              interval={timeFrameTrading}
              initialNumberOfCandles={300}
              onIntervalChanged={onTradingIntervalChanged}
              onStartChanged={onStartChanged}
              onPremiseBeforeChanged={onPremiseBeforeChanged}
              width={chart1Width}
              security={securityLastInfo}
              premise={premise}
              stops={stops}
              orders={orders}
              trades={trades}
              activeTrade={activeTrade}
              showGrid={true}
              possibleTrade={pTrade}
              onManageOrder={manageOrder}
            />
          </div>
          {chartNumber === 2 ? (
            <div className="p-col-6" ref={chart2Ref} style={{ padding: "0" }}>
              <ChartWrapper
                interval={timeFrameHigh}
                // start={start}
                initialNumberOfCandles={200}
                onIntervalChanged={(interval) => {}}
                onStartChanged={(start) => {}}
                width={chart2Width}
                security={securityLastInfo}
                premise={premise}
                stops={stops}
                orders={orders}
                trades={trades}
                activeTrade={activeTrade}
                showGrid={true}
                possibleTrade={pTrade}
                onManageOrder={manageOrder}
              />
            </div>
          ) : null}
        </div>
        <TrendViewCharts premise={premise} security={securityLastInfo} />
        <div className="p-grid">
          {/* <div className="p-col-12">
                        <MarketState filter={marketStateFilterDto}/>
                    </div>
                    <div className="p-col-12">
                        <SwingStateList filter={marketStateFilterDto}/>
                    </div> */}
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
