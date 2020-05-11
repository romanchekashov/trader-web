import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ClassCode} from "../../../common/data/ClassCode";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {Interval} from "../../../common/data/Interval";
import {getTrend} from "../../../common/api/rest/analysisRestApi";
import Alerts from "../../../common/components/alerts/Alerts";
import {PatternResult} from "../../../common/components/alerts/data/PatternResult";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {AlertsSize} from "../../../common/components/alerts/data/AlertsSize";

type Props = {
    classCode: ClassCode
    timeFrameHigh: Interval
    timeFrameTrading: Interval
    timeFrameLow: Interval
    future: any
    premise: TradePremise
};

let trendLowTFLoading = false;

const AnalysisFutures: React.FC<Props> = ({classCode, timeFrameHigh, timeFrameTrading, timeFrameLow, future, premise}) => {
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
                    history: true,
                    size: AlertsSize.MID,
                    all: false
                });
            }
        }


        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize);
        };
    }, [future, premise, timeFrameTrading, timeFrameLow]);

    const onAlertSelected = (alert: PatternResult) => {
        console.log(alert);
        setAlert(alert);
    };

    if (future) {

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
                                      security={future}
                                      premise={premise}
                                      showGrid={true}
                                      securityInfo={future}/>
                    </div>
                    <div className="p-col-5" ref={chart2Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameLow}
                                      width={chart2Width}
                                      security={future}
                                      trend={trendLowTF}
                                      showGrid={true}
                                      securityInfo={future}/>
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
                                              security={future}
                                              premise={premise}
                                              showGrid={true}
                                              securityInfo={future}/> : null
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