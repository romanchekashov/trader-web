import * as React from "react";
import {useEffect, useState, memo} from "react";
import {PatternResult} from "./data/PatternResult";
import {AlertsFilter} from "./data/AlertsFilter";
import "./Alerts.css";
import "./CandlePattern.css";
import {PatternName} from "./data/PatternName";
import {playSound} from "../../assets/assets";
import moment = require("moment");
import {getCandlePatterns} from "../../api/rest/analysisRestApi";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {Dropdown} from "primereact/components/dropdown/Dropdown";
import {PrimeDropdownItem} from "../../utils/utils";
import {Interval} from "../../data/Interval";
import {ClassCode} from "../../data/ClassCode";
import {getSecuritiesByClassCode, getSecurity} from "../../utils/Cache";
import {Security} from "../../data/Security";

type Props = {
    filter: AlertsFilter
    onAlertSelected: (alert: PatternResult) => void
    alertsHeight?: number
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const Alerts: React.FC<Props> = ({filter, onAlertSelected, alertsHeight}) => {

    const [interval, setInterval] = useState(null);
    const [classCode, setClassCode] = useState(null);
    const [secCode, setSecCode] = useState(null);
    const [secCodes, setSecCodes] = useState([{label: "ALL", value: null}]);

    const [visibleAlerts, setVisibleAlerts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [fetchAlertsError, setFetchAlertsError] = useState(null);
    const [selectedAlert, setSelectedAlert] = useState(null);

    const intervals: PrimeDropdownItem<Interval>[] = [null, Interval.M1, Interval.M2, Interval.M3, Interval.M5,
        Interval.M10, Interval.M15, Interval.M30, Interval.M60, Interval.H2, Interval.H4, Interval.DAY,
        Interval.WEEK, Interval.MONTH]
        .map(val => ({label: val || "ALL", value: val}));
    const classCodes: PrimeDropdownItem<ClassCode>[] = [null, ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
        .map(val => ({label: val || "ALL", value: val}));

    const fetchAlerts = () => {
        getCandlePatterns(filter)
            .then(newAlerts => {
                setAlerts(newAlerts);
                setVisibleAlerts(newAlerts);
                setFetchAlertsError(null);
            })
            .catch(reason => {
                setAlerts([]);
                setVisibleAlerts([]);
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
            onClassCodeChanged(filter.classCode);
            onSecCodeChanged(filter.secCode);
            if (filter.fetchByWS) {
                alertsSubscription = WebsocketService.getInstance()
                    .on<PatternResult[]>(filter.history ? WSEvent.HISTORY_ALERTS : WSEvent.ALERTS)
                    .subscribe(newAlerts => {
                        setAlerts(newAlerts);
                        setVisibleAlerts(newAlerts);
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
        return <>{moment(alert.candle.timestamp).format("HH:mm/DD MMM YY")}</>;
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

    const onIntervalChanged = (newInterval: Interval) => {
        console.log(newInterval);
        setInterval(newInterval);
        setFilteredAlerts(classCode, secCode, newInterval);
    };

    const onClassCodeChanged = (newClassCode: ClassCode) => {
        console.log(newClassCode);
        const newSecCodes: PrimeDropdownItem<string>[] = [{label: "ALL", value: null}];
        if (newClassCode) {
            const securities: Security[] = getSecuritiesByClassCode(newClassCode);
            for (const sec of securities) {
                newSecCodes.push({label: sec.secCode, value: sec.secCode});
            }
        } else {
            setSecCode(null);
        }
        setClassCode(newClassCode);
        setSecCodes(newSecCodes);
        setSecCode(null);
        setFilteredAlerts(newClassCode, null, interval);
    };

    const onSecCodeChanged = (newSecCode: string) => {
        console.log(newSecCode);
        setSecCode(newSecCode);
        setFilteredAlerts(classCode, newSecCode, interval);
    };

    const setFilteredAlerts = (newClassCode: ClassCode, newSecCode: string, newInterval: Interval) => {
        let filtered = alerts;
        if (newClassCode) {
            filtered = filtered.filter(value => value.classCode === newClassCode);
        }
        if (newSecCode) {
            filtered = filtered.filter(value => value.candle.symbol === newSecCode);
        }
        if (newInterval) {
            filtered = filtered.filter(value => value.interval === newInterval);
        }

        setVisibleAlerts(filtered);
    };

    const Row = ({index, style}) => {
        const alert = visibleAlerts[index];
        const className = "alerts-row " + (selectedAlert === alert ? "alerts-row-selected" : "");

        return (
            <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
                <div key={alert.name + alert.interval + alert.candle.timestamp}
                     className={className}
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
                    <div className="alerts-cell alerts-symbol" title={alert.candle.symbol}>
                        {alert.candle.symbol.substr(0, 8)}
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
            </div>
        );
    };

    return (
        <div className="p-grid alerts" style={{height: alertsHeight || 200}}>
            <div className="p-col-12 alerts-head">
                <div className="alerts-head-dropdown alerts-head-class-code">
                    <Dropdown value={classCode} options={classCodes}
                              onChange={(e) => {
                                  onClassCodeChanged(e.value);
                              }}/>
                </div>
                <div className="alerts-head-dropdown alerts-head-security">
                    <Dropdown value={secCode} options={secCodes}
                              onChange={(e) => {
                                  onSecCodeChanged(e.value);
                              }}/>
                </div>
                <div className="alerts-head-dropdown alerts-head-interval">
                    <Dropdown value={interval} options={intervals}
                              onChange={(e) => {
                                  onIntervalChanged(e.value);
                              }}/>
                </div>
            </div>
            <div className="p-col-12 alerts-body" style={{height: (alertsHeight || 200) - 20}}>
                <AutoSizer>
                    {({height, width}) => (
                        <List
                            className="List"
                            height={height}
                            itemCount={visibleAlerts.length}
                            itemSize={35}
                            width={width}
                        >
                            {Row}
                        </List>
                    )}
                </AutoSizer>
            </div>
        </div>
    )
};

export default memo(Alerts);