import * as React from "react";
import {memo, useEffect, useState} from "react";
import "./Notifications.css";
import {playSound} from "../../assets/assets";
import {getNotifications} from "../../api/rest/analysisRestApi";
import {WebsocketService, WSEvent} from "../../api/WebsocketService";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {Dropdown} from "primereact/components/dropdown/Dropdown";
import {Intervals, PrimeDropdownItem} from "../../utils/utils";
import {Interval} from "../../data/Interval";
import {ClassCode} from "../../data/ClassCode";
import {getSecuritiesByClassCode} from "../../utils/Cache";
import {Security} from "../../data/Security";
import {Calendar} from "primereact/calendar";
import {FilterDto} from "../../data/FilterDto";
import {NotificationDto} from "./data/NotificationDto";
import moment = require("moment");
import {InputText} from "primereact/inputtext";

type Props = {
    filter: FilterDto
    onNotificationSelected: (notification: NotificationDto) => void
    viewHeight?: number
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const Notifications: React.FC<Props> = ({filter, onNotificationSelected, viewHeight}) => {

    const [interval, setInterval] = useState(null);
    const [classCode, setClassCode] = useState(null);
    const [secCode, setSecCode] = useState(null);
    const [secCodes, setSecCodes] = useState([{label: "ALL", value: null}]);
    const [start, setStart] = useState(moment().hours(0).minutes(0).seconds(0).toDate());
    const [textPattern, setTextPattern] = useState("");

    const [visibleAlerts, setVisibleAlerts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [fetchAlertsError, setFetchAlertsError] = useState(null);
    const [selectedAlert, setSelectedAlert] = useState(null);

    const intervals: PrimeDropdownItem<Interval>[] = [null, ...Intervals]
        .map(val => ({label: val || "ALL", value: val}));
    const classCodes: PrimeDropdownItem<ClassCode>[] = [null, ClassCode.SPBFUT, ClassCode.TQBR, ClassCode.CETS]
        .map(val => ({label: val || "ALL", value: val}));

    const fetchAlerts = (newClassCode: ClassCode, newSecCode: string, newInterval: Interval, newStart: Date, newTextPattern: string) => {
        getNotifications(filter)
            .then(newAlerts => {
                setAlertsReceivedFromServer(newAlerts, newClassCode, newSecCode, newInterval, newStart, newTextPattern);
                setFetchAlertsError(null);
            })
            .catch(reason => {
                setAlerts([]);
                setVisibleAlerts([]);
                setFetchAlertsError("Cannot get alerts for " + filter.secCode);
                if (fetchAlertsAttempt < 3) {
                    fetchAlertsAttempt++;
                    fetchAlerts(newClassCode, newSecCode, newInterval, newStart, newTextPattern);
                }
            });
    };

    const notifyOnNewAlert = (newAlerts: NotificationDto[]): void => {
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
            onIntervalChanged(null);
            onTextPatternChanged("");

            if (filter.fetchByWS) {
                alertsSubscription = WebsocketService.getInstance()
                    .on<NotificationDto[]>(filter.history ? WSEvent.HISTORY_ALERTS : WSEvent.ALERTS)
                    .subscribe(newAlerts => {
                        setAlertsReceivedFromServer(newAlerts, classCode, secCode, interval, start, textPattern);
                    });
            } else {
                fetchAlerts(filter.classCode, filter.secCode, null, start, "");
            }
        }

        // Specify how to clean up after this effect:
        return function cleanup() {
            if (alertsSubscription) alertsSubscription.unsubscribe();
        };
    }, [filter]);

    const setAlertsReceivedFromServer = (newAlerts: NotificationDto[], newClassCode: ClassCode, newSecCode: string,
                                         newInterval: Interval, newStart: Date, newTextPattern: string): void => {
        setAlerts(newAlerts);
        setFilteredAlerts(newAlerts, newClassCode, newSecCode, newInterval, newStart, newTextPattern);
        notifyOnNewAlert(newAlerts);
    };

    if (!filter) {
        return (<>Filter for alerts is not set.</>);
    }

    if (filter && fetchAlertsError) {
        return (<div style={{color: "red"}}>{fetchAlertsError}</div>);
    }

    const timeTemplate = (alert: NotificationDto) => {
        return <>{moment(alert.created).format("HH:mm/DD MMM YY")}</>;
    };

    const nameTemplate = (alert: NotificationDto) => {
        let className = "alert-icon ";
        // const sInterval = alert.interval.toString();
        // const title = `${alert.name} - Interval: ${sInterval}`;

        return <div className={className} title={alert.title}></div>;
    };

    const confirmTemplate = (alert: NotificationDto) => {
        const className = false ? "confirm" : "";
        return <div className={className}></div>;
    };

    const possibleFutureDirectionUpTemplate = (alert: NotificationDto) => {
        const className = alert.title ? "direction-up" : "direction-down";
        return <div className={className}></div>;
    };

    const strengthTemplate = (alert: NotificationDto) => {
        const className = "strength-icon strength-";
        return <div className={className} title={alert.title}></div>;
    };

    const descriptionTemplate = (alert: NotificationDto) => {
        return <div title={alert.text}>{alert.text}</div>;
    };

    const onIntervalChanged = (newInterval: Interval) => {
        console.log(newInterval);
        setInterval(newInterval);
        setFilteredAlerts(alerts, classCode, secCode, newInterval, start, textPattern);
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
        setFilteredAlerts(alerts, newClassCode, null, interval, start, textPattern);
    };

    const onSecCodeChanged = (newSecCode: string) => {
        console.log(newSecCode);
        setSecCode(newSecCode);
        setFilteredAlerts(alerts, classCode, newSecCode, interval, start, textPattern);
    };

    const onStartDateChanged = (newStart: Date) => {
        console.log(newStart);
        setStart(newStart);
        setFilteredAlerts(alerts, classCode, secCode, interval, newStart, textPattern);
    };

    const onTextPatternChanged = (newTextPattern: string) => {
        console.log(newTextPattern);
        setTextPattern(newTextPattern);
        setFilteredAlerts(alerts, classCode, secCode, interval, start, newTextPattern);
    };

    const setFilteredAlerts = (alerts: NotificationDto[], newClassCode: ClassCode, newSecCode: string,
                               newInterval: Interval, newStart: Date, newTextPattern: string) => {
        let filtered = alerts;
        if (newClassCode) {
            filtered = filtered.filter(value => value.classCode === newClassCode);
        }
        if (newSecCode) {
            filtered = filtered.filter(value => value.securityCode === newSecCode);
        }
        if (newInterval) {
            filtered = filtered.filter(value => value.timeInterval === newInterval);
        }
        if (newStart) {
            filtered = filtered.filter(value => newStart.getTime() <= value.created.getTime());
        }
        if (newTextPattern) {
            filtered = filtered.filter(value => value.text.indexOf(newTextPattern) !== -1);
        }

        setVisibleAlerts(filtered);
    };

    const Row = ({index, style}) => {
        const alert = visibleAlerts[index];
        const className = "alerts-row " + (selectedAlert === alert ? "alerts-row-selected" : "");

        return (
            <div className={index % 2 ? "ListItemOdd" : "ListItemEven"} style={style}>
                <div key={alert.title + alert.timeInterval + alert.created}
                     className={className}
                     onClick={() => {
                         setSelectedAlert(alert);
                         onNotificationSelected(alert);
                     }}>
                    <div className="alerts-cell alerts-time">
                        {timeTemplate(alert)}
                    </div>
                    <div className="alerts-cell alerts-name">
                        {nameTemplate(alert)}
                    </div>
                    <div className="alerts-cell alerts-symbol" title={alert.securityCode}>
                        {alert.securityCode.substr(0, 8)}
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
        <div className="p-grid alerts" style={{height: viewHeight || 200}}>
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
                <div className="alerts-head-start-date">
                    <Calendar value={start}
                              onChange={(e) => onStartDateChanged(e.value as Date)}/>
                </div>
                <div className="alerts-head-start-date">
                    <InputText value={textPattern}
                               onChange={(e) => onTextPatternChanged(e.target['value'])} />
                </div>
            </div>
            <div className="p-col-12 alerts-body" style={{height: (viewHeight || 200) - 20}}>
                <AutoSizer>
                    {({height, width}) => (
                        <List
                            className="List"
                            height={height}
                            itemCount={visibleAlerts.length}
                            itemSize={90}
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

export default memo(Notifications);