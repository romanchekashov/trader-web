import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {Interval} from "../../../common/data/Interval";
import {getTradePremise} from "../../../common/api/rest/analysisRestApi";
import {PatternResult} from "../../../common/components/alerts/data/PatternResult";
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
import {ClassCode} from "../../../common/data/ClassCode";
import {Order} from "../../../common/data/Order";
import {ActiveTrade} from "../../../common/data/ActiveTrade";
import Alerts from "../../../common/components/alerts/Alerts";
import MarketState from "../../../common/components/market-state/MarketState";

type Props = {
    future: any
};

let trendLowTFLoading = false;

const AnalysisFutures: React.FC<Props> = ({future}) => {
    const [timeFrameHigh, setTimeFrameHigh] = useState(Interval.M30);
    const [timeFrameTrading, setTimeFrameTrading] = useState(Interval.M3);
    const [timeFrameLow, setTimeFrameLow] = useState(Interval.M1);
    const [premise, setPremise] = useState(null);
    const [orders, setOrders] = useState(null);
    const [activeTrade, setActiveTrade] = useState(null);

    const chartNumbers: PrimeDropdownItem<number>[] = [1, 2].map(val => ({label: "" + val, value: val}));
    const [chartNumber, setChartNumber] = useState(1);

    const [tradeSetup, setTradeSetup] = useState(null);
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
    const [marketStateFilterDto2, setMarketStateFilterDto2] = useState(null);
    const [alert, setAlert] = useState(null);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : 200);
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : 200);
        setChartAlertsWidth(chartAlertsRef.current ? chartAlertsRef.current.clientWidth : 200);
    };

    useEffect(() => {
        if (future) {
            // console.log("AnalysisFutures: ", future);
            informServerAboutRequiredData(future.classCode, future.secCode);

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
            if (!filterDto || filterDto.secCode !== future.secCode) {
                setFilterDto({
                    classCode: future.classCode,
                    secCode: future.secCode,
                    fetchByWS: true,
                    history: false,
                    all: false
                });
            }
            if (!marketStateFilterDto || marketStateFilterDto.secCode !== future.secCode) {
                setMarketStateFilterDto({
                    classCode: future.classCode,
                    secCode: future.secCode,
                    intervals: [Interval.M3, Interval.M1],
                    // fetchByWS: true,
                    // history: false,
                    numberOfCandles: 1000
                });
            }
            if (!marketStateFilterDto2 || marketStateFilterDto2.secCode !== future.secCode) {
                setMarketStateFilterDto2({
                    classCode: future.classCode,
                    secCode: future.secCode,
                    intervals: [Interval.M30, Interval.M3],
                    // fetchByWS: true,
                    // history: false,
                    numberOfCandles: 50
                });
            }
            //
            // fetchPremise(timeFrameTrading);
        }

        const wsStatusSub = WebsocketService.getInstance()
            .connectionStatus()
            .subscribe(isConnected => {
                if (isConnected && future) {
                    informServerAboutRequiredData(future.classCode, future.secCode);
                }
            });

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(securities => {
                if (future) {
                    const newSecurityLastInfo = securities.find(o => o.secCode === future.secCode);
                    if (newSecurityLastInfo) {
                        newSecurityLastInfo.timeLastTrade = new Date(newSecurityLastInfo.timeLastTrade);
                        setSecurityLastInfo(newSecurityLastInfo);
                    }
                }
            });

        const tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE)
            .subscribe(newPremise => {
                for (const srZone of newPremise.analysis.srZones) {
                    srZone.timestamp = new Date(srZone.timestamp)
                }
                setPremise(newPremise);
            });

        const ordersSetupSubscription = WebsocketService.getInstance()
            .on<Order[]>(WSEvent.ORDERS)
            .subscribe(setOrders);

        const activeTradeSubscription = WebsocketService.getInstance()
            .on<ActiveTrade>(WSEvent.ACTIVE_TRADE)
            .subscribe(setActiveTrade);


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
    }, [future]);


    const informServerAboutRequiredData = (classCode: ClassCode, secCode: string): void => {
        if (classCode && secCode) {
            WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1,
                tradingPlatform: TradingPlatform.QUIK,
                classCode,
                secCode,
                timeFrameHigh: Interval.M30,
                timeFrameTrading: Interval.M5,
                timeFrameLow: Interval.M1
            });
            WebsocketService.getInstance().send(WSEvent.GET_TRADES_AND_ORDERS, secCode);
        }
    };

    const fetchPremise = (timeFrameTrading: Interval) => {
        getTradePremise({
            brokerId: 1,
            tradingPlatform: TradingPlatform.QUIK,
            classCode: future.classCode,
            secCode: future.secCode,
            timeFrameHigh,
            timeFrameTrading,
            timeFrameLow
        }).then(setPremise).catch(reason => {
            fetchPremise(timeFrameTrading);
        })
    };

    const onChartNumberChanged = (num: number) => {
        setChartNumber(num);
        setTimeout(updateSize, 1000);
    };

    const onAlertSelected = (alert: PatternResult) => {
        console.log(alert);
        setAlert(alert);
    };

    const onTradingIntervalChanged = (interval: Interval) => {
        console.log(interval);
        setTimeFrameTrading(interval);
        fetchPremise(interval);
    };

    if (future) {

        return (
            <>
                <div className="p-grid analysis-head">
                    <div className="p-col-12">
                        <div className="analysis-head-chart-number">
                            <Dropdown value={chartNumber} options={chartNumbers}
                                      onChange={(e) => onChartNumberChanged(e.value)}/>
                        </div>
                    </div>
                    <div className="p-col-12">
                        <DataTable value={[future]}>
                            <Column field="totalDemand" header="Общ спрос"/>
                            <Column field="totalSupply" header="Общ предл"/>
                            <Column field="sellDepoPerContract" header="ГО прод"/>
                            <Column field="buyDepoPerContract" header="ГО покуп"/>
                            <Column field="todayMoneyTurnover" header="Оборот"/>
                            <Column field="numberOfTradesToday" header="Кол-во сделок"/>
                        </DataTable>
                    </div>
                </div>
                <TrendsView trends={premise ? premise.analysis.trends : []}/>
                <div className="p-grid" style={{margin: '0'}}>
                    <div className={chartNumber === 2 ? "p-col-7" : "p-col-12"} ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameTrading}
                                      initialNumberOfCandles={500}
                                      onIntervalChanged={onTradingIntervalChanged}
                                      width={chart1Width}
                                      security={future}
                                      premise={premise}
                                      orders={orders}
                                      activeTrade={activeTrade}
                                      showGrid={true}/>
                    </div>
                    {
                        chartNumber === 2 ? (
                            <div className="p-col-5" ref={chart2Ref} style={{padding: '0'}}>
                                <ChartWrapper interval={timeFrameLow}
                                              initialNumberOfCandles={1000}
                                              onIntervalChanged={interval => {
                                              }}
                                              width={chart2Width}
                                              security={future}
                                              premise={premise}
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
                        <MarketState filter={marketStateFilterDto2}/>
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
                                              onIntervalChanged={interval => {
                                              }}
                                              alert={alert}
                                              width={chartAlertsWidth}
                                              security={future}
                                              premise={premise}
                                              showGrid={true}/> : null
                        }
                    </div>
                </div>
            </>
        )
    } else {
        return (
            <div>Select security for analysis</div>
        )
    }
};

export default AnalysisFutures;