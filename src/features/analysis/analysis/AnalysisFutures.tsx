import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {Interval} from "../../../common/data/Interval";
import {
    getMoexApiOpenInterestList,
    getMoexOpenInterests,
    getTradePremise
} from "../../../common/api/rest/analysisRestApi";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import {Dropdown} from "primereact/dropdown";
import {PrimeDropdownItem} from "../../../common/utils/utils";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import Notifications from "../../../common/components/notifications/Notifications";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {Order} from "../../../common/data/Order";
import {ActiveTrade} from "../../../common/data/ActiveTrade";
import Alerts from "../../../common/components/alerts/Alerts";
import MarketState from "../../../common/components/market-state/MarketState";
import SwingStateList from "../../../common/components/swing-state/SwingStateList";
import {MoexOpenInterest} from "../../../common/data/open-interest/MoexOpenInterest";
import {adjustTradePremise} from "../../../common/utils/DataUtils";
import {MoexOpenInterestView} from "./MoexOpenInterestView";
import {Trade} from "../../../common/data/Trade";
import {getTrades} from "../../../common/api/rest/quikRestApi";
import {TabPanel, TabView} from "primereact/tabview";
import {MoexOpenInterestChart} from "./MoexOpenInterestChart";
import {EconomicCalendar} from "../../../common/components/economic-calendar/EconomicCalendar";
import {News} from "../../../common/components/news/News";
import {SecurityAnalysis} from "../../../common/data/SecurityAnalysis";
import moment = require("moment");
import {StopOrder} from "../../../common/data/StopOrder";

type Props = {
    security: SecurityAnalysis
};

const AnalysisFutures: React.FC<Props> = ({security}) => {
    const timeFrameTradingIntervals = {
        "M1": [Interval.M1],
        "M3": [Interval.M3, Interval.M1],
        "M5": [Interval.M5, Interval.M1],
        "M15": [Interval.M15, Interval.M3],
        "M30": [Interval.M30, Interval.M5],
        "M60": [Interval.M60, Interval.M15],
        "H2": [Interval.H2, Interval.M30],
        "H4": [Interval.H4, Interval.M60],
        "DAY": [Interval.DAY, Interval.H2],
        "WEEK": [Interval.WEEK, Interval.DAY],
        "MONTH": [Interval.MONTH, Interval.WEEK]
    };

    const [start, setStart] = useState(moment().subtract(1, 'days').hours(9).minutes(0).seconds(0).toDate());
    const [timeFrameTrading, setTimeFrameTrading] = useState(Interval.M3);
    const [timeFrameMin, setTimeFrameMin] = useState(Interval.M1);
    const [premise, setPremise] = useState(null);
    const [orders, setOrders] = useState<Order[]>(null);
    const [stopOrders, setStopOrders] = useState<StopOrder[]>(null);
    const [activeTrade, setActiveTrade] = useState(null);

    const chartNumbers: PrimeDropdownItem<number>[] = [1, 2].map(val => ({label: "" + val, value: val}));
    const [chartNumber, setChartNumber] = useState(1);

    const [securityLastInfo, setSecurityLastInfo] = useState(null);
    const [chart1Width, setChart1Width] = useState(200);
    const [chart2Width, setChart2Width] = useState(200);
    const [chartAlertsWidth, setChartAlertsWidth] = useState(200);
    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const chartAlertsRef = useRef(null);
    const [trendLowTF, setTrendLowTF] = useState(null);
    const [filterDto, setFilterDto] = useState(null);
    const [marketStateFilterDto, setMarketStateFilterDto] = useState(null);
    const [alert, setAlert] = useState(null);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [moexOpenInterestsForDays, setMoexOpenInterestsForDays] = useState<MoexOpenInterest[]>([]);
    const [moexOpenInterests, setMoexOpenInterests] = useState<MoexOpenInterest[]>([]);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : 200);
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : 200);
        setChartAlertsWidth(chartAlertsRef.current ? chartAlertsRef.current.clientWidth : 200);
    };

    useEffect(() => {
        if (security) {
            console.log("AnalysisFutures: ", security);
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
            if (!filterDto || filterDto.secCode !== security.secCode) {
                setFilterDto({
                    classCode: security.classCode,
                    secCode: security.secCode,
                    fetchByWS: true,
                    history: false,
                    all: false
                });
            }
            updateMarketStateFilterDto(timeFrameTrading);

            fetchPremise(timeFrameTrading);

            getMoexOpenInterests(security.classCode, security.secCode, moment().subtract(100, 'days').format("YYYY-MM-DD"))
                .then(setMoexOpenInterestsForDays);

            getMoexApiOpenInterestList(security.classCode, security.secCode)
                .then(setMoexOpenInterests);

            getTrades(40).then(setTrades);

            if (!securityLastInfo) {
                setSecurityLastInfo({
                    classCode: security.classCode,
                    secCode: security.secCode,
                    valueToday: null,
                    priceLastTrade: security.lastTradePrice,
                    timeLastTrade: security.lastTradeTime,
                    quantityLastTrade: security.lastTradeQuantity,
                    valueLastTrade: null,
                    numTrades: security.numberOfTradesToday,
                    futureTotalDemand: null,
                    futureTotalSupply: null,
                    futureSellDepoPerContract: null,
                    futureBuyDepoPerContract: null
                });
            }
        }

        const intervalToFetchOpenInterest = setInterval(() => {
            if (security) {
                getMoexApiOpenInterestList(security.classCode, security.secCode)
                    .then(setMoexOpenInterests)
            }
        }, 120000)

        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe(isConnected => {
                if (isConnected && security) {
                    informServerAboutRequiredData();
                }
            });

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                if (security) {
                    const newSecurityLastInfo = securities.find(o => o.secCode === security.secCode);
                    if (newSecurityLastInfo) {
                        newSecurityLastInfo.timeLastTrade = new Date(newSecurityLastInfo.timeLastTrade);
                        setSecurityLastInfo(newSecurityLastInfo);
                    }
                }
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

        const stopOrdersSubscription = WebsocketService.getInstance()
            .on<StopOrder[]>(WSEvent.STOP_ORDERS)
            .subscribe(setStopOrders);

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade[]>(WSEvent.ACTIVE_TRADES)
            .subscribe(activeTrades => {
                if (security) {
                    const activeTrade = activeTrades
                        .find(at => at && at.classCode === security.classCode && at.secCode === security.secCode);
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
            stopOrdersSubscription.unsubscribe();
            activeTradeSubscription.unsubscribe();
            clearInterval(intervalToFetchOpenInterest)
        };
    }, [security]);

    const updateMarketStateFilterDto = (interval: Interval) => {
        setMarketStateFilterDto({
            classCode: security.classCode,
            secCode: security.secCode,
            intervals: timeFrameTradingIntervals[interval],
            fetchByWS: true,
            // history: false,
            numberOfCandles: 100
        });
        WebsocketService.getInstance().send(WSEvent.GET_MARKET_STATE, {
            classCode: security.classCode,
            secCode: security.secCode,
            intervals: timeFrameTradingIntervals[interval],
            fetchByWS: true,
            // history: false,
            numberOfCandles: 100
        });
    };

    const informServerAboutRequiredData = (): void => {
        if (security) {
            WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1,
                tradingPlatform: TradingPlatform.QUIK,
                classCode: security.classCode,
                secCode: security.secCode,
                timeFrameTrading: Interval.M5,
                timeFrameMin: Interval.M1
            });
            WebsocketService.getInstance().send(WSEvent.GET_TRADES_AND_ORDERS, security.secCode);
            WebsocketService.getInstance().send(WSEvent.GET_MARKET_STATE, {
                classCode: security.classCode,
                secCode: security.secCode,
                intervals: timeFrameTradingIntervals[timeFrameTrading],
                fetchByWS: true,
                // history: false,
                numberOfCandles: 100
            });
        }
    };

    const fetchPremise = (timeFrameTrading: Interval) => {
        getTradePremise({
            brokerId: 1,
            tradingPlatform: TradingPlatform.QUIK,
            classCode: security.classCode,
            secCode: security.secCode,
            timeFrameTrading,
            timeFrameMin
        }).then(setPremise).catch(reason => {
            fetchPremise(timeFrameTrading);
        });
    };

    const onChartNumberChanged = (num: number) => {
        setChartNumber(num);
        setTimeout(updateSize, 1000);
    };

    const onTradingIntervalChanged = (interval: Interval) => {
        setTimeFrameTrading(interval);
        fetchPremise(interval);
        updateMarketStateFilterDto(interval);
    };

    const onStartChanged = (start: Date) => {
        setStart(start);
    };

    if (security) {

        return (
            <TabView>
                <TabPanel header="Chart">
                    <div className="p-grid analysis-head">
                        <div className="p-col-12">
                            <div className="analysis-head-chart-number">
                                <Dropdown value={chartNumber} options={chartNumbers}
                                          onChange={(e) => onChartNumberChanged(e.value)}/>
                            </div>
                        </div>
                        <div className="p-col-12">
                            <DataTable value={[securityLastInfo]}>
                                <Column field="futureTotalDemand" header="Общ спрос"/>
                                <Column field="futureTotalSupply" header="Общ предл"/>
                                <Column field="futureSellDepoPerContract" header="ГО прод"/>
                                <Column field="futureBuyDepoPerContract" header="ГО покуп"/>
                                <Column field="priceLastTrade" header="Цена"/>
                                <Column field="numTrades" header="Кол-во сделок"/>
                            </DataTable>
                        </div>
                    </div>
                    <TrendsView trends={premise ? premise.analysis.trends : []}/>
                    <div className="p-grid" style={{margin: '0'}}>
                        <div className={chartNumber === 2 ? "p-col-7" : "p-col-12"} ref={chart1Ref}
                             style={{padding: '0'}}>
                            <ChartWrapper interval={timeFrameTrading}
                                          initialNumberOfCandles={500}
                                          onIntervalChanged={onTradingIntervalChanged}
                                          onStartChanged={onStartChanged}
                                          width={chart1Width}
                                          security={securityLastInfo}
                                          premise={premise}
                                          stops={stopOrders}
                                          orders={orders}
                                          trades={trades}
                                          activeTrade={activeTrade}
                                          showGrid={true}/>
                        </div>
                        {
                            chartNumber === 2 ? (
                                <div className="p-col-5" ref={chart2Ref} style={{padding: '0'}}>
                                    <ChartWrapper interval={timeFrameMin}
                                                  start={start}
                                                  initialNumberOfCandles={500}
                                                  onIntervalChanged={interval => {
                                                  }}
                                                  onStartChanged={start => {
                                                  }}
                                                  width={chart2Width}
                                                  security={securityLastInfo}
                                                  premise={premise}
                                                  trades={trades}
                                                  trend={trendLowTF}
                                                  showGrid={true}/>
                                </div>
                            ) : null
                        }
                    </div>
                    <div className="p-grid">
                        <div className="p-col-12">
                            <MarketState filter={marketStateFilterDto}/>
                        </div>
                        <div className="p-col-12">
                            <SwingStateList filter={marketStateFilterDto}/>
                        </div>
                        <div className="p-col-12">
                            <div className="p-grid">
                                <div className="p-col-4">
                                    <Notifications filter={filterDto}
                                                   onNotificationSelected={(n) => {
                                                       console.log(n)
                                                   }}
                                                   viewHeight={400}/>
                                </div>
                                <div className="p-col-4">
                                    <Alerts filter={filterDto}
                                            onAlertSelected={(n) => {
                                                console.log(n)
                                            }}
                                            alertsHeight={400}/>
                                </div>
                            </div>
                        </div>
                        <div className="p-col-12" ref={chartAlertsRef} style={{padding: '0'}}>
                            {
                                alert ?
                                    <ChartWrapper interval={alert.interval}
                                                  start={start}
                                                  onIntervalChanged={interval => {
                                                  }}
                                                  onStartChanged={start => {
                                                  }}
                                                  alert={alert}
                                                  width={chartAlertsWidth}
                                                  security={securityLastInfo}
                                                  premise={premise}
                                                  showGrid={true}/> : null
                            }
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Open Interest">
                    <div className="p-grid analysis-head">
                        <div className="p-col-6">
                            <MoexOpenInterestView moexOpenInterest={moexOpenInterestsForDays.length > 0
                                ? moexOpenInterestsForDays[moexOpenInterestsForDays.length - 1] : null}/>
                        </div>
                        <div className="p-col-6">
                            <MoexOpenInterestChart moexOpenInterests={moexOpenInterests}
                                                   title={"Real-time OI for last date"}
                                                   dateTimeFormat={"HH:mm/DD MMM YY"}
                                                   width={500} height={400}/>
                        </div>
                        <div className="p-col-12">
                            <MoexOpenInterestChart moexOpenInterests={moexOpenInterestsForDays}
                                                   title={"OI history"}
                                                   dateTimeFormat={"DD MMM YY"}
                                                   width={1000} height={600}/>
                        </div>
                    </div>
                    <div className="p-grid">

                    </div>
                </TabPanel>
                <TabPanel header="News">
                    <News secId={security.id}/>
                </TabPanel>
                <TabPanel header="Calendar">
                    <EconomicCalendar secId={security.id}/>
                </TabPanel>
            </TabView>
        )
    } else {
        return (
            <div>Select security for analysis</div>
        )
    }
};

export default AnalysisFutures;