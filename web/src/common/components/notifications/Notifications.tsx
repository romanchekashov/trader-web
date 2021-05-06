import * as React from "react";
import { memo, useEffect, useState } from "react";
import "./styles/Notifications.css";
import "./styles/Signals.css";
import { playSound } from "../../assets/assets";
import { getNotifications } from "../../api/rest/analysisRestApi";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  getRecentBusinessDate,
  Intervals,
  PrimeDropdownItem,
} from "../../utils/utils";
import { Interval } from "../../data/Interval";
import { ClassCode } from "../../data/ClassCode";
import { getSecuritiesByClassCode } from "../../utils/Cache";
import { Security } from "../../data/security/Security";
import { Calendar } from "primereact/calendar";
import { FilterDto } from "../../data/FilterDto";
import { NotificationDto } from "./data/NotificationDto";
import { InputText } from "primereact/inputtext";
import { PatternName } from "../alerts/data/PatternName";
import { WebsocketService, WSEvent } from "../../api/WebsocketService";
import moment = require("moment");
import { Dropdown } from "primereact/dropdown";

type Props = {
  filter: FilterDto;
  security: Security;
  onNotificationSelected: (notification: NotificationDto) => void;
  viewHeight?: number;
  itemSize?: number;
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const Notifications: React.FC<Props> = ({
  filter,
  security,
  onNotificationSelected,
  viewHeight,
  itemSize,
}) => {
  const [interval, setInterval] = useState(null);
  const [classCode, setClassCode] = useState(null);
  const [secCode, setSecCode] = useState(null);
  const [secCodes, setSecCodes] = useState([{ label: "ALL", value: null }]);
  const [start, setStart] = useState<Date>(
    getRecentBusinessDate(
      moment().subtract(60, "days").hours(0).minutes(0).seconds(0).toDate()
    )
  );
  const [textPattern, setTextPattern] = useState("");

  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fetchAlertsError, setFetchAlertsError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const intervals: PrimeDropdownItem<Interval>[] = [
    null,
    ...Intervals,
  ].map((val) => ({ label: val || "ALL", value: val }));
  const classCodes: PrimeDropdownItem<ClassCode>[] = [
    null,
    ClassCode.SPBFUT,
    ClassCode.TQBR,
    ClassCode.CETS,
  ].map((val) => ({ label: val || "ALL", value: val }));

  const fetchAlerts = (
    secId: number,
    newInterval: Interval,
    newStart: Date,
    newTextPattern: string
  ) => {
    getNotifications(filter)
      .then((newAlerts) => {
        setAlertsReceivedFromServer(
          newAlerts,
          security.classCode,
          security.code,
          newInterval,
          newStart,
          newTextPattern
        );
        setFetchAlertsError(null);
      })
      .catch((reason) => {
        setAlerts([]);
        setVisibleAlerts([]);
        setFetchAlertsError("Cannot get alerts for " + filter.secId);
        if (fetchAlertsAttempt < 3) {
          fetchAlertsAttempt++;
          fetchAlerts(secId, newInterval, newStart, newTextPattern);
        }
      });
  };

  const notifyOnNewAlert = (newAlerts: NotificationDto[]): void => {
    if (newAlerts && newAlerts.length !== previousAlertsCount) {
      playSound(4);
      previousAlertsCount = newAlerts.length;
    }
  };

  const getWSNotifications = (filter: FilterDto): void => {
    WebsocketService.getInstance().send<FilterDto>(
      WSEvent.GET_NOTIFICATIONS,
      filter
    );
  };

  useEffect(() => {
    let alertsSubscription;
    let wsStatusSub;

    if (filter && security) {
      fetchAlertsAttempt = 0;

      // onClassCodeChanged(filter.classCode);
      // onSecCodeChanged(filter.secCode);
      onIntervalChanged(null);
      onTextPatternChanged("");

      if (filter.fetchByWS) {
        setTimeout(() => getWSNotifications(filter), 500);

        alertsSubscription = WebsocketService.getInstance()
          .on<NotificationDto[]>(
            filter.history
              ? WSEvent.HISTORY_NOTIFICATIONS
              : WSEvent.NOTIFICATIONS
          )
          .subscribe((notifications) => {
            for (const notification of notifications) {
              notification.created = new Date(notification.created);
              notification.notified = new Date(notification.notified);
            }
            setAlertsReceivedFromServer(
              notifications,
              classCode,
              secCode,
              interval,
              start,
              textPattern
            );
          });

        wsStatusSub = WebsocketService.getInstance()
          .connectionStatus()
          .subscribe((isConnected) => {
            if (isConnected && filter) {
              getWSNotifications(filter);
            }
          });
      } else {
        fetchAlerts(filter.secId, null, start, "");
      }
    }

    // Specify how to clean up after this effect:
    return function cleanup() {
      if (alertsSubscription) alertsSubscription.unsubscribe();
      if (wsStatusSub) wsStatusSub.unsubscribe();
    };
  }, [filter, security]);

  const setAlertsReceivedFromServer = (
    newAlerts: NotificationDto[],
    newClassCode: ClassCode,
    newSecCode: string,
    newInterval: Interval,
    newStart: Date,
    newTextPattern: string
  ): void => {
    setAlerts(newAlerts);
    setFilteredAlerts(
      newAlerts,
      newClassCode,
      newSecCode,
      newInterval,
      newStart,
      newTextPattern
    );
    notifyOnNewAlert(newAlerts);
  };

  if (!filter) {
    return <>Filter for notifications is not set.</>;
  }

  if (filter && fetchAlertsError) {
    return <div style={{ color: "red" }}>{fetchAlertsError}</div>;
  }

  const timeTemplate = (alert: NotificationDto) => {
    return <>{moment(alert.created).format("HH:mm/DD MMM YY")}</>;
  };

  const nameTemplate = (alert: NotificationDto) => {
    let className = "alert-icon ";
    const sInterval = alert.timeInterval.toString();
    const title = `${alert.title} - Interval: ${sInterval}`;
    const sArr = alert.title.split("-");

    if (sArr.length > 1) {
      if ("CANDLE_PATTERN" === sArr[0]) {
        className += getCandlePatternClassName(alert);
      } else if ("PRICE_CLOSE_TO_SR_LEVEL" === sArr[0]) {
        const cls = alert.title.replace(
          "PRICE_CLOSE_TO_SR_LEVEL",
          "sr_level_cross"
        );
        className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
      } else if ("PRICE_CLOSE_TO_TREND_LINE" === sArr[0]) {
        const cls = alert.title.replace(
          "PRICE_CLOSE_TO_TREND_LINE",
          "trend_line_cross"
        );
        className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
      } else if ("SR_ZONE_CROSS" === sArr[0]) {
        className += alert.title.toLowerCase();
      } else if (alert.text.toLowerCase().indexOf("рост") >= 0) {
        className += "direction-up";
      } else if (alert.text.toLowerCase().indexOf("падение") >= 0) {
        className += "direction-down";
      }
    }

    return <div className={className} title={title}></div>;
  };

  const getCandlePatternClassName = (alert: NotificationDto) => {
    let className = "";
    const name = alert.title.split("-")[1];
    const sInterval = alert.timeInterval.toString();

    if (PatternName.BEARISH_REVERSAL_PATTERN_DARK_CLOUD_COVER === name) {
      className +=
        "bearish-reversal-pattern-dark-cloud-cover-" + sInterval.toLowerCase();
    } else if (PatternName.BEARISH_REVERSAL_PATTERN_ENGULFING === name) {
      className +=
        "bearish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
    } else if (PatternName.BEARISH_REVERSAL_PATTERN_EVENING_STAR === name) {
      className +=
        "bearish-reversal-pattern-evening-star-" + sInterval.toLowerCase();
    } else if (PatternName.BEARISH_REVERSAL_PATTERN_HANGING_MAN === name) {
      className +=
        "bearish-reversal-pattern-hanging-man-" + sInterval.toLowerCase();
    } else if (PatternName.BEARISH_REVERSAL_PATTERN_HARAMI === name) {
      className += "bearish-reversal-pattern-harami-" + sInterval.toLowerCase();
    } else if (PatternName.BEARISH_REVERSAL_PATTERN_SHOOTING_STAR === name) {
      className +=
        "bearish-reversal-pattern-shooting-star-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_ENGULFING === name) {
      className +=
        "bullish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_HAMMER === name) {
      className += "bullish-reversal-pattern-hammer-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_HARAMI === name) {
      className += "bullish-reversal-pattern-harami-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_INVERTED_HAMMER === name) {
      className +=
        "bullish-reversal-pattern-inverted-hammer-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_MORNING_STAR === name) {
      className +=
        "bullish-reversal-pattern-morning-star-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_PIERCING === name) {
      className +=
        "bullish-reversal-pattern-piercing-" + sInterval.toLowerCase();
    } else if (PatternName.REVERSAL_PATTERN_DOJI === name) {
      className += "reversal-pattern-doji-" + sInterval.toLowerCase();
    }
    return className;
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

  const descriptionTemplate = (dto: NotificationDto): any => {
    let index = dto.text.indexOf("[");
    let description = index !== -1 ? dto.text.substr(index) : dto.text;
    description = description.replace("CANDLE_PATTERN - ", "");
    description = description.split("Interval")[0];

    // return <div title={dto.text}>{description}</div>
    return '<div title="' + dto.text + '">' + description + "</div>";
  };

  const onIntervalChanged = (newInterval: Interval) => {
    setInterval(newInterval);
    setFilteredAlerts(
      alerts,
      classCode,
      secCode,
      newInterval,
      start,
      textPattern
    );
  };

  const onClassCodeChanged = (newClassCode: ClassCode) => {
    const newSecCodes: PrimeDropdownItem<string>[] = [
      { label: "ALL", value: null },
    ];
    if (newClassCode) {
      const securities: Security[] = getSecuritiesByClassCode(newClassCode);
      for (const sec of securities) {
        newSecCodes.push({ label: sec.code, value: sec.code });
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
    setSecCode(newSecCode);
    setFilteredAlerts(
      alerts,
      classCode,
      newSecCode,
      interval,
      start,
      textPattern
    );
  };

  const onStartDateChanged = (newStart: Date) => {
    setStart(newStart);
    setFilteredAlerts(
      alerts,
      classCode,
      secCode,
      interval,
      newStart,
      textPattern
    );
  };

  const onTextPatternChanged = (newTextPattern: string) => {
    setTextPattern(newTextPattern);
    setFilteredAlerts(
      alerts,
      classCode,
      secCode,
      interval,
      start,
      newTextPattern
    );
  };

  const setFilteredAlerts = (
    alerts: NotificationDto[],
    newClassCode: ClassCode,
    newSecCode: string,
    newInterval: Interval,
    newStart: Date,
    newTextPattern: string
  ) => {
    let filtered = alerts;
    if (newClassCode) {
      filtered = filtered.filter((value) => value.classCode === newClassCode);
    }
    if (newSecCode) {
      filtered = filtered.filter((value) => value.code === newSecCode);
    }
    if (newInterval) {
      filtered = filtered.filter((value) => value.timeInterval === newInterval);
    }
    if (newStart) {
      filtered = filtered.filter(
        (value) => newStart.getTime() <= value.created.getTime()
      );
    }
    if (newTextPattern) {
      filtered = filtered.filter(
        (value) => value.text.indexOf(newTextPattern) !== -1
      );
    }

    // if (alerts.length > 0) debugger
    // console.log(newClassCode, newSecCode, newInterval, newStart, newTextPattern, alerts, filtered)
    setVisibleAlerts(filtered);
  };

  const Row = ({ index, style }) => {
    const alert = visibleAlerts[index];
    const className =
      "notifications-row " +
      (selectedAlert === alert ? "notifications-row-selected" : "");

    return (
      <div
        className={
          index % 2
            ? "notifications-list-item-odd"
            : "notifications-list-item-even"
        }
        style={style}
      >
        <div
          key={alert.title + alert.timeInterval + alert.created}
          className={className}
          onClick={() => {
            setSelectedAlert(alert);
            onNotificationSelected(alert);
          }}
        >
          <div className="notifications-title">
            <div
              className="notifications-cell notifications-symbol"
              title={alert.code}
            >
              {alert.code?.substr(0, 8)}
            </div>
            <div className="notifications-cell notifications-time">
              {timeTemplate(alert)}
            </div>
            <div className="notifications-cell notifications-name">
              {nameTemplate(alert)}
            </div>
            {/*<div className="alerts-cell alerts-strength">
                        {strengthTemplate(alert)}
                        </div>
                        <div className="alerts-cell alerts-confirm">
                            {confirmTemplate(alert)}
                        </div>
                        <div className="alerts-cell alerts-direction">
                            {possibleFutureDirectionUpTemplate(alert)}
                        </div>*/}
          </div>
          <div>
            <div
              className="notifications-cell notifications-description"
              dangerouslySetInnerHTML={{ __html: descriptionTemplate(alert) }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-grid notifications" style={{ height: viewHeight || 200 }}>
      <div className="p-col-12 notifications-head">
        <div className="notifications-head-dropdown notifications-head-class-code">
          {filter ? (
            classCode
          ) : (
            <Dropdown
              value={classCode}
              options={classCodes}
              onChange={(e) => {
                onClassCodeChanged(e.value);
              }}
            />
          )}
        </div>
        <div className="notifications-head-dropdown notifications-head-security">
          {filter ? (
            secCode
          ) : (
            <Dropdown
              value={secCode}
              options={secCodes}
              onChange={(e) => {
                onSecCodeChanged(e.value);
              }}
            />
          )}
        </div>
        <div className="notifications-head-dropdown notifications-head-interval">
          <Dropdown
            value={interval}
            options={intervals}
            onChange={(e) => {
              onIntervalChanged(e.value);
            }}
          />
        </div>
        <div className="notifications-head-start-date">
          <Calendar
            value={start}
            onChange={(e) => onStartDateChanged(e.value as Date)}
          />
        </div>
        <div className="notifications-head-start-date">
          <InputText
            value={textPattern}
            onChange={(e) => onTextPatternChanged(e.target["value"])}
          />
        </div>
      </div>
      <div
        className="p-col-12 notifications-body"
        style={{ height: (viewHeight || 200) - 30 }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="notifications-list"
              height={height}
              itemCount={visibleAlerts.length}
              itemSize={itemSize || 100}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default memo(Notifications);
