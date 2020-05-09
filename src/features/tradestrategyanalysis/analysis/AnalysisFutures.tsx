import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ClassCode} from "../../../common/data/ClassCode";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {SecurityFuture} from "../../../common/data/SecurityFuture";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {Interval} from "../../../common/data/Interval";
import {WebsocketService, WSEvent} from "../../../common/api/WebsocketService";
import {SecurityLastInfo} from "../../../common/data/SecurityLastInfo";
import {TradeSetup} from "../../../common/data/strategy/TradeSetup";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import TrendView from "../../../common/components/trend/TrendView";
import {getTrend} from "../../../common/api/rest/analysisRestApi";
import Alerts from "../../../common/components/alerts/Alerts";
import {PatternResult} from "../../../common/components/alerts/data/PatternResult";
import {timeout} from "rxjs/operators";
import {TrendsView} from "../../../common/components/trend/TrendsView";

type Props = {
    classCode: ClassCode
    timeFrameHigh: Interval
    timeFrameTrading: Interval
    timeFrameLow: Interval
    future: SecurityFuture
    initPremise: TradePremise
};

let trendLowTFLoading = false;

const AnalysisFutures: React.FC<Props> = ({classCode, timeFrameHigh, timeFrameTrading, timeFrameLow, future, initPremise}) => {
    const [premise, setPremise] = useState(initPremise);
    const [tradeSetup, setTradeSetup] = useState(null);
    const [securityLastInfo, setSecurityLastInfo] = useState(null);
    const [chart1Width, setChart1Width] = useState(200);
    const [chart2Width, setChart2Width] = useState(200);
    const [chartAlertsWidth, setChartAlertsWidth] = useState(200);
    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const chartAlertsRef = useRef(null);
    const [trendLowTF, setTrendLowTF] = useState(null);
    const [alertsFilter, setAlertsFilter] = useState(null);
    const [alert, setAlert] = useState(null);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : 200);
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : 200);
        setChartAlertsWidth(chartAlertsRef.current ? chartAlertsRef.current.clientWidth : 200);
    };

    useEffect(() => {
        if (future) {
            // console.log("AnalysisFutures: ", classCode, timeFrameHigh, timeFrameTrading, timeFrameLow, future, initPremise);

            // WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
            //     brokerId: 1, tradingPlatform: TradingPlatform.QUIK,
            //     classCode: classCode, secCode: future.secCode,
            //     timeFrameHigh, timeFrameTrading, timeFrameLow
            // });
            if (!trendLowTF && !trendLowTFLoading) {
                trendLowTFLoading = true;
                getTrend(classCode, future.secCode, timeFrameLow, 540)
                    .then(trend => {
                        setTrendLowTF(trend);
                        trendLowTFLoading = false;
                    })
                    .catch(reason => {
                        trendLowTFLoading = false;
                    });
            }

            if (!alertsFilter || alertsFilter.secCode !== future.secCode) {
                setAlertsFilter({
                    classCode: classCode,
                    secCode: future.secCode,
                    fetchByWS: false,
                    history: true
                });
            }
        }

        setPremise(initPremise);

        const lastSecuritiesSubscription = WebsocketService.getInstance()
            .on<SecurityLastInfo[]>(WSEvent.LAST_SECURITIES)
            .subscribe(value => {
                const securities = value.map(c => {
                    c.timeLastTrade = new Date(c.timeLastTrade);
                    return c;
                });
                if (future) {
                    let security = securities.find(o => o.secCode === future.secCode);
                    setSecurityLastInfo(security);
                }
            });

        const tradePremiseSubscription = WebsocketService.getInstance()
            .on<TradePremise>(WSEvent.TRADE_PREMISE).subscribe(premise => {
                setPremise(premise);
            });

        const tradeSetupSubscription = WebsocketService.getInstance()
            .on<TradeSetup>(WSEvent.TRADE_SETUP).subscribe(setup => {
                setTradeSetup(setup);
            });


        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);

        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe();
            tradePremiseSubscription.unsubscribe();
            tradeSetupSubscription.unsubscribe();
            window.removeEventListener('resize', updateSize);
        };
    }, [future, initPremise, timeFrameTrading, timeFrameLow]);

    const onAlertSelected = (alert: PatternResult) => {
        console.log(alert);
        setAlert(alert);
    };

    if (future) {
        let security: SecurityLastInfo = securityLastInfo;
        if (!security) {
            security = {
                secCode: future.secCode,
                classCode: ClassCode.SPBFUT,
                priceLastTrade: future.lastTradePrice,
                timeLastTrade: null,
                quantityLastTrade: null,
                numTrades: null,
                valueLastTrade: null,
                valueToday: null
            };
        }

        return (
            <div>
                <div className="p-grid">
                    <div className="p-col-2">Общ спрос: {future.totalDemand}</div>
                    <div className="p-col-2">Общ предл: {future.totalSupply}</div>
                    <div className="p-col-2">ГО прод: {future.sellDepoPerContract}</div>
                    <div className="p-col-2">ГО покуп: {future.buyDepoPerContract}</div>
                    <div className="p-col-2">Оборот: {future.todayMoneyTurnover}</div>
                    <div className="p-col-2">Кол-во сделок: {future.numberOfTradesToday}</div>
                </div>
                <TrendsView trends={premise ? premise.analysis.trends : []}/>
                <div className="p-grid" style={{margin: '0'}}>
                    <div className="p-col-7" ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameTrading}
                                      width={chart1Width}
                                      security={security}
                                      premise={premise}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-5" ref={chart2Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameLow}
                                      width={chart2Width}
                                      security={security}
                                      trend={trendLowTF}
                                      showGrid={true}/>
                    </div>
                </div>
                <div className="p-grid">
                    <div className="p-col-5">
                        <Alerts filter={alertsFilter}
                                onAlertSelected={onAlertSelected}/>
                    </div>
                    <div className="p-col-7" ref={chartAlertsRef} style={{padding: '0'}}>
                        {
                            alert ?
                                <ChartWrapper interval={alert.interval}
                                              alert={alert}
                                              width={chartAlertsWidth}
                                              security={security}
                                              premise={premise}
                                              showGrid={true}/> : null
                        }
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div>Select security for analysis</div>
        )
    }
};

export default AnalysisFutures;