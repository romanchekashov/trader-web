import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {ClassCode} from "../../../common/data/ClassCode";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import {Interval} from "../../../common/data/Interval";
import {getTradePremise, getTrend} from "../../../common/api/rest/analysisRestApi";
import Alerts from "../../../common/components/alerts/Alerts";
import {PatternResult} from "../../../common/components/alerts/data/PatternResult";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {AlertsSize} from "../../../common/components/alerts/data/AlertsSize";
import {TradingPlatform} from "../../../common/data/TradingPlatform";
import {Dropdown} from "primereact/dropdown";
import {Intervals, PrimeDropdownItem} from "../../../common/utils/utils";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";

type Props = {
    classCode: ClassCode
    future: any
};

let trendLowTFLoading = false;

const AnalysisFutures: React.FC<Props> = ({classCode, future}) => {
    const [timeFrameHigh, setTimeFrameHigh] = useState(Interval.M30);
    const [timeFrameTrading, setTimeFrameTrading] = useState(Interval.M3);
    const [timeFrameLow, setTimeFrameLow] = useState(Interval.M1);
    const [premise, setPremise] = useState(null);

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
    const [alertsFilter, setAlertsFilter] = useState(null);
    const [alert, setAlert] = useState(null);

    const updateSize = () => {
        setChart1Width(chart1Ref.current ? chart1Ref.current.clientWidth : 200);
        setChart2Width(chart2Ref.current ? chart2Ref.current.clientWidth : 200);
        setChartAlertsWidth(chartAlertsRef.current ? chartAlertsRef.current.clientWidth : 200);
    };

    useEffect(() => {
        if (future) {
            console.log("AnalysisFutures: ", future);

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

            fetchPremise(timeFrameTrading);
        }


        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize);
        };
    }, [future]);

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
                            <Column field="totalDemand" header="Общ спрос" />
                            <Column field="totalSupply" header="Общ предл" />
                            <Column field="sellDepoPerContract" header="ГО прод" />
                            <Column field="buyDepoPerContract" header="ГО покуп" />
                            <Column field="todayMoneyTurnover" header="Оборот" />
                            <Column field="numberOfTradesToday" header="Кол-во сделок" />
                        </DataTable>
                    </div>
                </div>
                <TrendsView trends={premise ? premise.analysis.trends : []}/>
                <div className="p-grid" style={{margin: '0'}}>
                    <div className={chartNumber === 2 ? "p-col-7" : "p-col-12"} ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameTrading}
                                      initialNumberOfCandles={1000}
                                      onIntervalChanged={onTradingIntervalChanged}
                                      width={chart1Width}
                                      security={future}
                                      premise={premise}
                                      showGrid={true}/>
                    </div>
                    {
                        chartNumber === 2 ? (
                            <div className="p-col-5" ref={chart2Ref} style={{padding: '0'}}>
                                <ChartWrapper interval={timeFrameLow}
                                              onIntervalChanged={interval => {}}
                                              width={chart2Width}
                                              security={future}
                                              trend={trendLowTF}
                                              showGrid={true}/>
                            </div>
                        ) : null
                    }
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
                                              onIntervalChanged={interval => {}}
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