import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ClassCode} from "../../../data/ClassCode";
import {TradePremise} from "../../../data/strategy/TradePremise";
import {SecurityFuture} from "../../../api/dto/SecurityFuture";
import {ChartWrapper} from "../../../components/chart/ChartWrapper";
import {Interval} from "../../../data/Interval";
import {WebsocketService, WSEvent} from "../../../api/WebsocketService";
import {SecurityLastInfo} from "../../../data/SecurityLastInfo";
import {TradeSetup} from "../../../data/strategy/TradeSetup";
import {TradingPlatform} from "../../../api/dto/TradingPlatform";
import TrendView from "./TrendView";
import {getTrend} from "../../../api/tradestrategyanalysis/tradeStrategyAnalysisApi";
import Alerts from "../../../components/alerts/Alerts";
import {PatternResult} from "../../../components/alerts/data/PatternResult";

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
    const chart1Ref = useRef(null);
    const chart2Ref = useRef(null);
    const [trendLowTF, setTrendLowTF] = useState(null);
    const [alertsFilter, setAlertsFilter] = useState(null);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : 200);
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : 200);
    };

    useEffect(() => {
        if (future) {
            // console.log("AnalysisFutures: ", classCode, timeFrameHigh, timeFrameTrading, timeFrameLow, future, initPremise);

            WebsocketService.getInstance().send(WSEvent.GET_TRADE_PREMISE_AND_SETUP, {
                brokerId: 1, tradingPlatform: TradingPlatform.QUIK,
                classCode: classCode, secCode: future.secCode,
                timeFrameHigh, timeFrameTrading, timeFrameLow
            });
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


        updateSize();
        window.addEventListener('resize', updateSize);
        // Specify how to clean up after this effect:
        return function cleanup() {
            lastSecuritiesSubscription.unsubscribe();
            tradePremiseSubscription.unsubscribe();
            tradeSetupSubscription.unsubscribe();
            window.removeEventListener('resize', updateSize);
        };
    });

    const onAlertSelected = (alert: PatternResult) => {
        console.log(alert);
    };

    if (future && premise) {

        return (
            <div>
                <div className="p-grid">
                    <div className="p-col-6">
                        <Alerts filter={alertsFilter} onAlertSelected={onAlertSelected}/>
                    </div>
                </div>
                <div className="p-grid" style={{margin: '0'}}>
                    <div className="p-col-8" ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameTrading}
                                      numberOfCandles={168}
                                      classCode={classCode}
                                      securityCode={future.secCode}
                                      width={chart1Width}
                                      security={securityLastInfo}
                                      premise={premise}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-4" ref={chart2Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameLow}
                                      numberOfCandles={540}
                                      classCode={classCode}
                                      securityCode={future.secCode}
                                      width={chart2Width}
                                      security={securityLastInfo}
                                      trend={trendLowTF}
                                      showGrid={true}/>
                    </div>
                </div>
                <TrendView trend={premise.analysis.trend}/>
            </div>
        )
    } else {
        return (
            <div>Select security for analysis</div>
        )
    }
};

export default AnalysisFutures;