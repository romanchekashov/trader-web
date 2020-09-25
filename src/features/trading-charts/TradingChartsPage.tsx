import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {getFilterData} from "../../common/api/rest/botControlRestApi";
import {MarketBotFilterDataDto} from "../../common/data/bot/MarketBotFilterDataDto";
import {MarketBotStartDto} from "../../common/data/bot/MarketBotStartDto";
import {CHART_MIN_WIDTH, ChartWrapper} from "../../common/components/chart/ChartWrapper";
import {TradePremise} from "../../common/data/strategy/TradePremise";
import {SecurityLastInfo} from "../../common/data/SecurityLastInfo";
import {Interval} from "../../common/data/Interval";
import {WebsocketService, WSEvent} from "../../common/api/WebsocketService";
import {adjustTradePremise} from "../../common/utils/DataUtils";
import {Order} from "../../common/data/Order";
import {ActiveTrade} from "../../common/data/ActiveTrade";
import {TradingChartsSecurities} from "./TradingChartsSecurities";
import {TradingPlatform} from "../../common/data/trading/TradingPlatform";
import {TrendsView} from "../../common/components/trend/TrendsView";
import {TradeStrategyAnalysisFilterDto} from "../../common/data/TradeStrategyAnalysisFilterDto";
import {Market} from "../../common/data/Market";
import {BrokerId} from "../../common/data/BrokerId";

export const TradingChartsPage: React.FC = () => {
    const [filterData, setFilterData] = useState<MarketBotFilterDataDto>(null);
    const [filter, setFilter] = useState<MarketBotStartDto>(null);
    const [securityLastInfo, setSecurityLastInfo] = useState<SecurityLastInfo>(null);
    const [securities, setSecurities] = useState<SecurityLastInfo[]>([]);
    const [premise, setPremise] = useState<TradePremise>(null);
    const [orders, setOrders] = useState(null);
    const [activeTrade, setActiveTrade] = useState(null);

    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const chart3Ref = useRef(null);
    const chart4Ref = useRef(null);
    const chart5Ref = useRef(null);
    const [chart1Width, setChart1Width] = useState(CHART_MIN_WIDTH);
    const [chart2Width, setChart2Width] = useState(CHART_MIN_WIDTH);
    const [chart3Width, setChart3Width] = useState(CHART_MIN_WIDTH);
    const [chart4Width, setChart4Width] = useState(CHART_MIN_WIDTH);
    const [chart5Width, setChart5Width] = useState(CHART_MIN_WIDTH);
    const [timeFrame1, setTimeFrame1] = useState<Interval>(Interval.M3);
    const [timeFrame2, setTimeFrame2] = useState<Interval>(Interval.M1);
    const [timeFrame3, setTimeFrame3] = useState<Interval>(Interval.DAY);
    const [timeFrame4, setTimeFrame4] = useState<Interval>(Interval.H2);
    const [timeFrame5, setTimeFrame5] = useState<Interval>(Interval.M30);

    useEffect(() => {
        getFilterData(false).then(setFilterData);

        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe(isConnected => {
                if (isConnected && securityLastInfo) {
                    informServerAboutRequiredData(securityLastInfo);
                }
            });

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                for (const sec of securities) {
                    sec.lastTradeTime = new Date(sec.lastTradeTime);
                }
                setSecurities(securities)
            });

        const tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE)
            .subscribe(newPremise => {
                adjustTradePremise(newPremise);
                setPremise(newPremise);
            });

        const ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.ORDERS)
            .subscribe(setOrders);

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES)
            .subscribe(activeTrades => {
                if (securityLastInfo) {
                    const activeTrade = activeTrades
                        .find(at => at && at.classCode === securityLastInfo.classCode && at.secCode === securityLastInfo.secCode);
                    setActiveTrade(activeTrade);
                }
            });


        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize);
            wsStatusSub.unsubscribe();
            lastSecuritiesSubscription.unsubscribe();
            tradePremiseSubscription.unsubscribe();
            ordersSetupSubscription.unsubscribe();
            activeTradeSubscription.unsubscribe();
        };
    }, []);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : CHART_MIN_WIDTH)
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : CHART_MIN_WIDTH)
        setChart3Width(chart3Ref.current ? chart3Ref.current.clientWidth : CHART_MIN_WIDTH)
        setChart4Width(chart4Ref.current ? chart4Ref.current.clientWidth : CHART_MIN_WIDTH)
        setChart5Width(chart5Ref.current ? chart5Ref.current.clientWidth : CHART_MIN_WIDTH)
    }

    const informServerAboutRequiredData = (securityLastInfo: SecurityLastInfo): void => {
        if (securityLastInfo) {
            WebsocketService.getInstance().send<TradeStrategyAnalysisFilterDto>(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: securityLastInfo.market === Market.SPB ? BrokerId.TINKOFF_INVEST : BrokerId.ALFA_DIRECT,
                tradingPlatform: securityLastInfo.market === Market.SPB ? TradingPlatform.API : TradingPlatform.QUIK,
                secId: securityLastInfo.id,
                timeFrameTrading: timeFrame1,
                timeFrameMin: timeFrame4
            })
            WebsocketService.getInstance().send<string>(WSEvent.GET_TRADES_AND_ORDERS, securityLastInfo.secCode)
        }
    }

    const onStart = (filter: MarketBotStartDto): void => {
        setFilter(filter)
    }

    const onSecuritySelected = (secLastInfo: SecurityLastInfo): void => {
        setSecurityLastInfo(secLastInfo)
        informServerAboutRequiredData(secLastInfo)
    }

    return (
        <div className="p-grid sample-layout analysis">
            {/*<div className="p-col-12" style={{padding: 0}}>
                <Filter filter={filterData} onStart={onStart}/>
            </div>*/}
            <div className="p-col-12">
                <TrendsView trends={premise ? premise.analysis.trends : []}/>
            </div>
            <div className="p-col-12">
                <div className="p-grid">
                    <div className="p-col-4">
                        <TradingChartsSecurities securities={securities}
                                                 onSelectRow={onSecuritySelected}/>
                    </div>
                    <div className="p-col-4" ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame1}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={() => {
                                      }}
                                      onStartChanged={() => {
                                      }}
                                      width={chart1Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart2Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame2}
                                      initialNumberOfCandles={120}
                                      onIntervalChanged={() => {
                                      }}
                                      onStartChanged={() => {
                                      }}
                                      width={chart2Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart3Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame3}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={() => {
                                      }}
                                      onStartChanged={() => {
                                      }}
                                      width={chart3Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart4Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame4}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={() => {
                                      }}
                                      onStartChanged={() => {
                                      }}
                                      width={chart4Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart5Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrame5}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={() => {
                                      }}
                                      onStartChanged={() => {
                                      }}
                                      width={chart5Width}
                                      chartHeight={400}
                                      security={securityLastInfo}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                </div>
            </div>
        </div>
    );
};
