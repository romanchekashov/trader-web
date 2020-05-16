import * as React from "react";
import {useEffect} from "react";
import {ClassCode} from "../../../common/data/ClassCode";
import {SecurityShare} from "../../../common/data/SecurityShare";
import {TradePremise} from "../../../common/data/strategy/TradePremise";
import {Interval} from "../../../common/data/Interval";
import {TrendsView} from "../../../common/components/trend/TrendsView";
import {SecurityCurrency} from "../../../common/data/SecurityCurrency";
import {ChartWrapper} from "../../../common/components/chart/ChartWrapper";
import Alerts from "../../../common/components/alerts/Alerts";
import {useState} from "react";
import {useRef} from "react";
import {PatternResult} from "../../../common/components/alerts/data/PatternResult";
import {AlertsSize} from "../../../common/components/alerts/data/AlertsSize";

export interface AnalysisState {
    realDepo: boolean
}

type Props = {
    classCode: ClassCode
    timeFrameHigh: Interval
    timeFrameTrading: Interval
    timeFrameLow: Interval
    security: any
    premise: TradePremise
}

const Analysis: React.FC<Props> = ({classCode, timeFrameHigh, timeFrameTrading, timeFrameLow, security, premise}) => {
    let initState: AnalysisState = {
        realDepo: false
    };

    const share: SecurityShare = classCode === ClassCode.TQBR ? security : null;
    const currency: SecurityCurrency = classCode === ClassCode.CETS ? security : null;
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
        if (security) {
            if (!alertsFilter || alertsFilter.secCode !== security.secCode) {
                setAlertsFilter({
                    classCode: security.classCode,
                    secCode: security.secCode,
                    fetchByWS: false,
                    history: true,
                    size: AlertsSize.MID,
                    all: false
                });
            }
        }

        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);
        return function cleanup() {
            window.removeEventListener('resize', updateSize);
        };
    }, [security, premise, timeFrameTrading, timeFrameLow]);

    const onAlertSelected = (alert: PatternResult) => {
        console.log(alert);
        setAlert(alert);
    };

    if (security) {
        return (
            <>
                <div className="p-grid">
                    <div className="p-col-2">Кол-во посл: {security.lastTradeQuantity}</div>
                    <div className="p-col-2">Лот: {security.lotSize}</div>
                    <div className="p-col-2">Объем обр.: {security.issueSize}</div>
                    <div className="p-col-2">Ср. взв. цена: {security.weightedAveragePrice}</div>
                    <div className="p-col-2">Оборот: {security.todayMoneyTurnover}</div>
                    <div className="p-col-2">Кол-во сделок: {security.numberOfTradesToday}</div>
                </div>
                <TrendsView trends={premise ? premise.analysis.trends : []}/>
                <div className="p-grid" style={{margin: '0'}}>
                    <div className="p-col-7" ref={chart1Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameTrading}
                                      onIntervalChanged={interval => {}}
                                      width={chart1Width}
                                      security={security}
                                      premise={premise}
                                      showGrid={true}/>
                    </div>
                    <div className="p-col-5" ref={chart2Ref} style={{padding: '0'}}>
                        <ChartWrapper interval={timeFrameLow}
                                      onIntervalChanged={interval => {}}
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
                                              onIntervalChanged={interval => {}}
                                              alert={alert}
                                              width={chartAlertsWidth}
                                              security={security}
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

export default Analysis;