import * as React from "react";
import {useEffect, useState} from "react";
import {PatternResult} from "./data/PatternResult";
import {AlertsFilter} from "./data/AlertsFilter";
import "./Alerts.css";
import "./CandlePattern.css";
import {PatternName} from "./data/PatternName";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {playSound} from "../../assets/assets";
import moment = require("moment");
import {getCandlePatterns} from "../../api/tradestrategyanalysis/tradeStrategyAnalysisApi";

type Props = {
    filter: AlertsFilter
    onAlertSelected: (alert: PatternResult) => void
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const Alerts: React.FC<Props> = ({filter, onAlertSelected}) => {

    const [alerts, setAlerts] = useState([]);
    const [fetchAlertsError, setFetchAlertsError] = useState(null);
    const [selectedAlert, setSelectedAlert] = useState(null);

    const fetchAlerts = () => {
        getCandlePatterns(filter)
            .then(newAlerts => {
                setAlerts(newAlerts);
                setFetchAlertsError(null);
            })
            .catch(reason => {
                setAlerts([]);
                setFetchAlertsError("Cannot get alerts for " + filter.secCode);
                if (fetchAlertsAttempt < 3) {
                    fetchAlertsAttempt++;
                    fetchAlerts();
                }
            });
    };

    const notifyOnNewAlert = (newAlerts: PatternResult[]): void => {
        if (newAlerts && newAlerts.length !== previousAlertsCount) {
            playSound(4);
            previousAlertsCount = newAlerts.length;
        }
    };

    useEffect(() => {
        let alertsSubscription;
        if (filter) {
            fetchAlertsAttempt = 0;
            if (filter.fetchByWS) {
                alertsSubscription = WebsocketService.getInstance()
                    .on<PatternResult[]>(filter.history ? WSEvent.HISTORY_ALERTS : WSEvent.ALERTS)
                    .subscribe(newAlerts => {
                        setAlerts(newAlerts);
                        notifyOnNewAlert(newAlerts);
                    });
            } else {
                fetchAlerts();
            }
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, [filter]);

    if (!filter) {
        return (<>Filter for alerts is not set.</>);
    }

    if (filter && fetchAlertsError) {
        return (<div style={{color: "red"}}>{fetchAlertsError}</div>);
    }

    const timeTemplate = (alert: PatternResult) => {
        return <>{moment(alert.candle.timestamp).format("HH:mm - DD MMM YY")}</>;
    };

    const nameTemplate = (alert: PatternResult) => {
        let className = "alert-icon ";
        const sInterval = alert.interval.toString();
        const title = `${alert.name} - Interval: ${sInterval}`;

        if (PatternName.BEARISH_REVERSAL_PATTERN_DARK_CLOUD_COVER === alert.name) {
            className += "bearish-reversal-pattern-dark-cloud-cover-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_ENGULFING === alert.name) {
            className += "bearish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_EVENING_STAR === alert.name) {
            className += "bearish-reversal-pattern-evening-star-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_HANGING_MAN === alert.name) {
            className += "bearish-reversal-pattern-hanging-man-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_HARAMI === alert.name) {
            className += "bearish-reversal-pattern-harami-" + sInterval.toLowerCase();
        } else if (PatternName.BEARISH_REVERSAL_PATTERN_SHOOTING_STAR === alert.name) {
            className += "bearish-reversal-pattern-shooting-star-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_ENGULFING === alert.name) {
            className += "bullish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_HAMMER === alert.name) {
            className += "bullish-reversal-pattern-hammer-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_HARAMI === alert.name) {
            className += "bullish-reversal-pattern-harami-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_INVERTED_HAMMER === alert.name) {
            className += "bullish-reversal-pattern-inverted-hammer-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_MORNING_STAR === alert.name) {
            className += "bullish-reversal-pattern-morning-star-" + sInterval.toLowerCase();
        } else if (PatternName.BULLISH_REVERSAL_PATTERN_PIERCING === alert.name) {
            className += "bullish-reversal-pattern-piercing-" + sInterval.toLowerCase();
        } else if (PatternName.REVERSAL_PATTERN_DOJI === alert.name) {
            className += "reversal-pattern-doji-" + sInterval.toLowerCase();
        }
        return <div className={className} title={title}></div>;
    };

    const confirmTemplate = (alert: PatternResult) => {
        const className = alert.hasConfirmation ? "confirm" : "";
        return <div className={className}></div>;
    };

    const possibleFutureDirectionUpTemplate = (alert: PatternResult) => {
        const className = alert.possibleFutureDirectionUp ? "direction-up" : "direction-down";
        return <div className={className}></div>;
    };

    const strengthTemplate = (alert: PatternResult) => {
        const className = "strength-icon strength-" + alert.strength.toString().toLowerCase();
        return <div className={className} title={alert.strength}></div>;
    };

    const descriptionTemplate = (alert: PatternResult) => {
        return <div title={alert.description}>{alert.description}</div>;
    };

    return (
        <div className="p-grid alerts">
            {alerts.map(alert => {
                const className = "alerts-row " + (selectedAlert === alert ? "alerts-row-selected" : "") ;
                return (
                    <div key={alert.candle.timestamp + alert.interval} className={className}
                         onClick={() => {
                             setSelectedAlert(alert);
                             onAlertSelected(alert);
                         }}>
                        <div className="alerts-cell alerts-time">
                            {timeTemplate(alert)}
                        </div>
                        <div className="alerts-cell alerts-name">
                            {nameTemplate(alert)}
                        </div>
                        <div className="alerts-cell alerts-symbol">
                            {alert.candle.symbol}
                        </div>
                        <div className="alerts-cell alerts-strength">
                            {strengthTemplate(alert)}
                        </div>
                        <div className="alerts-cell alerts-confirm">
                            {confirmTemplate(alert)}
                        </div>
                        <div className="alerts-cell alerts-direction">
                            {possibleFutureDirectionUpTemplate(alert)}
                        </div>
                        <div className="alerts-cell alerts-description">
                            {descriptionTemplate(alert)}
                        </div>
                    </div>
                );
            })}
        </div>
    )
};

export default Alerts;