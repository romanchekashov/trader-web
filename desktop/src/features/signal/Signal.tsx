import * as React from "react";
import {useEffect, useRef, useState} from "react";
import Alerts from "../../common/components/alerts/Alerts";
import {ChartWrapper} from "../../common/components/chart/ChartWrapper";
import {PatternResult} from "../../common/components/alerts/data/PatternResult";
import "./Signal.css";
import {AlertsSize} from "../../common/components/alerts/data/AlertsSize";
import {getTradePremise} from "../../common/api/rest/analysisRestApi";
import {TradingPlatform} from "../../common/data/TradingPlatform";
import {Interval} from "../../common/data/Interval";

export const Signal: React.FC<{}> = ({}) => {

    const [filter, setFilter] = useState({
        secCode: null,
        classCode: null,
        history: true,
        fetchByWS: false,
        size: AlertsSize.SMALL,
        all: true
    });
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [security, setSecurity] = useState(null);
    const [premise, setPremise] = useState(null);
    const [chartAlertsWidth, setChartAlertsWidth] = useState(200);
    const chartAlertsRef = useRef(null);

    const updateSize = () => {
        setChartAlertsWidth(chartAlertsRef.current ? chartAlertsRef.current.clientWidth : 200);
    };

    useEffect(() => {
        setTimeout(updateSize, 1000);
        window.addEventListener('resize', updateSize);

        // Specify how to clean up after this effect:
        return function cleanup() {
            window.removeEventListener('resize', updateSize);
        };
    }, []);

    const onAlertSelected = (alert: PatternResult) => {
        console.log(alert);
        setSelectedAlert(alert);
        setSecurity({
            classCode: alert.classCode,
            secCode: alert.candle.symbol,
            interval: alert.interval
        });

        if (!premise || premise.analysis.tradingStrategyConfig.secCode !== alert.candle.symbol) {
            getTradePremise({
                brokerId: 1,
                tradingPlatform: TradingPlatform.QUIK,
                classCode: alert.classCode,
                secCode: alert.candle.symbol,
                timeFrameHigh: Interval.M30,
                timeFrameTrading: Interval.M5,
                timeFrameLow: Interval.M1
            }).then(newPremise => {
                if (newPremise && newPremise.analysis.srZones) {
                    for (const srZone of newPremise.analysis.srZones) {
                        srZone.timestamp = new Date(srZone.timestamp)
                    }
                }
                setPremise(newPremise);
            }).catch(console.error);
        }
    };

    return (
        <div className="p-grid signal">
            <div className="p-col-4">
                <Alerts filter={filter}
                        onAlertSelected={onAlertSelected}
                        alertsHeight={600}/>
            </div>
            <div className="p-col-8" ref={chartAlertsRef} style={{padding: '0'}}>
                {
                    selectedAlert ?
                        <ChartWrapper interval={selectedAlert.interval}
                                      alert={selectedAlert}
                                      width={chartAlertsWidth}
                                      security={security}
                                      premise={premise}
                                      showGrid={true}/> : null
                }
            </div>
        </div>
    )
};