import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import * as React from "react";
import { memo, useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { getCandlePatterns } from "../../api/rest/analysisRestApi";
import { WebsocketService, WSEvent } from "../../api/WebsocketService";
import { playSound } from "../../assets/assets";
import { ClassCode } from "../../data/ClassCode";
import { FilterDto } from "../../data/FilterDto";
import { Interval } from "../../data/Interval";
import { Security } from "../../data/security/Security";
import { getSecuritiesByClassCode } from "../../utils/Cache";
import { Intervals, PrimeDropdownItem } from "../../utils/utils";
import "./Alerts.css";
import "./CandlePattern.css";
import { PatternName } from "./data/PatternName";
import { PatternResult } from "./data/PatternResult";
import moment = require("moment");

type Props = {
  filter: FilterDto;
  security: Security;
  onAlertSelected: (alert: PatternResult) => void;
  alertsHeight?: number;
};
let fetchAlertsAttempt = 0;
let previousAlertsCount = 0;

const Alerts: React.FC<Props> = ({
  filter,
  security,
  onAlertSelected,
  alertsHeight,
}) => {
  const [interval, setInterval] = useState(null);
  const [classCode, setClassCode] = useState(null);
  const [secCode, setSecCode] = useState(null);
  const [secCodes, setSecCodes] = useState([{ label: "ALL", value: null }]);
  const [start, setStart] = useState(
    moment().hours(0).minutes(0).seconds(0).toDate()
  );

  const [visibleAlerts, setVisibleAlerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [fetchAlertsError, setFetchAlertsError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const intervals: PrimeDropdownItem<Interval>[] = [null, ...Intervals].map(
    (val) => ({ label: val || "ALL", value: val })
  );
  const classCodes: PrimeDropdownItem<ClassCode>[] = [
    null,
    ClassCode.SPBFUT,
    ClassCode.TQBR,
    ClassCode.CETS,
  ].map((val) => ({ label: val || "ALL", value: val }));

  const fetchAlerts = (
    secId: number,
    newInterval: Interval,
    newStart: Date
  ) => {
    getCandlePatterns(filter)
      .then((newAlerts) => {
        setAlertsReceivedFromServer(
          newAlerts,
          security?.classCode,
          security?.code,
          newInterval,
          newStart
        );
        setFetchAlertsError(null);
      })
      .catch((reason) => {
        setAlerts([]);
        setVisibleAlerts([]);
        setFetchAlertsError("Cannot get alerts for " + filter.secId);
        if (fetchAlertsAttempt < 3) {
          fetchAlertsAttempt++;
          fetchAlerts(secId, newInterval, newStart);
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

      // onClassCodeChanged(filter.classCode);
      // onSecCodeChanged(filter.secCode);
      onIntervalChanged(null);
      fetchAlerts(filter.secId, null, start);

      if (filter.fetchByWS) {
        alertsSubscription = WebsocketService.getInstance()
          .on<PatternResult[]>(
            filter.history ? WSEvent.HISTORY_ALERTS : WSEvent.ALERTS
          )
          .subscribe((newAlerts) => {
            for (const result of newAlerts) {
              result.candle.timestamp = new Date(result.candle.timestamp);
            }
            setAlertsReceivedFromServer(
              newAlerts,
              classCode,
              secCode,
              interval,
              start
            );
          });
      }
    }

    // Specify how to clean up after this effect:
    return function cleanup() {
      if (alertsSubscription) alertsSubscription.unsubscribe();
    };
  }, [filter?.secId, classCode, secCode, interval, start]);

  const setAlertsReceivedFromServer = (
    newAlerts: PatternResult[],
    newClassCode: ClassCode,
    newSecCode: string,
    newInterval: Interval,
    newStart: Date
  ): void => {
    setAlerts(newAlerts);
    setFilteredAlerts(
      newAlerts,
      newClassCode,
      newSecCode,
      newInterval,
      newStart
    );
    notifyOnNewAlert(newAlerts);
  };

  if (!filter) {
    return <>Filter for alerts is not set.</>;
  }

  if (filter && fetchAlertsError) {
    return <div style={{ color: "red" }}>{fetchAlertsError}</div>;
  }

  const timeTemplate = (alert: PatternResult) => {
    return <>{moment(alert.candle.timestamp).format("HH:mm/DD MMM YY")}</>;
  };

  const nameTemplate = (alert: PatternResult) => {
    let className = "alert-icon ";
    const sInterval = alert.interval.toString();
    const title = `${alert.name} - Interval: ${sInterval}`;

    if (PatternName.BEARISH_REVERSAL_PATTERN_DARK_CLOUD_COVER === alert.name) {
      className +=
        "bearish-reversal-pattern-dark-cloud-cover-" + sInterval.toLowerCase();
    } else if (PatternName.BEARISH_REVERSAL_PATTERN_ENGULFING === alert.name) {
      className +=
        "bearish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
    } else if (
      PatternName.BEARISH_REVERSAL_PATTERN_EVENING_STAR === alert.name
    ) {
      className +=
        "bearish-reversal-pattern-evening-star-" + sInterval.toLowerCase();
    } else if (
      PatternName.BEARISH_REVERSAL_PATTERN_HANGING_MAN === alert.name
    ) {
      className +=
        "bearish-reversal-pattern-hanging-man-" + sInterval.toLowerCase();
    } else if (PatternName.BEARISH_REVERSAL_PATTERN_HARAMI === alert.name) {
      className += "bearish-reversal-pattern-harami-" + sInterval.toLowerCase();
    } else if (
      PatternName.BEARISH_REVERSAL_PATTERN_SHOOTING_STAR === alert.name
    ) {
      className +=
        "bearish-reversal-pattern-shooting-star-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_ENGULFING === alert.name) {
      className +=
        "bullish-reversal-pattern-engulfing-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_HAMMER === alert.name) {
      className += "bullish-reversal-pattern-hammer-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_HARAMI === alert.name) {
      className += "bullish-reversal-pattern-harami-" + sInterval.toLowerCase();
    } else if (
      PatternName.BULLISH_REVERSAL_PATTERN_INVERTED_HAMMER === alert.name
    ) {
      className +=
        "bullish-reversal-pattern-inverted-hammer-" + sInterval.toLowerCase();
    } else if (
      PatternName.BULLISH_REVERSAL_PATTERN_MORNING_STAR === alert.name
    ) {
      className +=
        "bullish-reversal-pattern-morning-star-" + sInterval.toLowerCase();
    } else if (PatternName.BULLISH_REVERSAL_PATTERN_PIERCING === alert.name) {
      className +=
        "bullish-reversal-pattern-piercing-" + sInterval.toLowerCase();
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
    const className = alert.possibleFutureDirectionUp
      ? "direction-up"
      : "direction-down";
    return <div className={className}></div>;
  };

  const strengthTemplate = (alert: PatternResult) => {
    const className =
      "strength-icon strength-" + alert.strength.toString().toLowerCase();
    return <div className={className} title={alert.strength}></div>;
  };

  const descriptionTemplate = (alert: PatternResult) => {
    return <div title={alert.description}>{alert.description}</div>;
  };

  const onIntervalChanged = (newInterval: Interval) => {
    console.log(newInterval);
    setInterval(newInterval);
    setFilteredAlerts(alerts, classCode, secCode, newInterval, start);
  };

  const onClassCodeChanged = (newClassCode: ClassCode) => {
    console.log(newClassCode);
    const newSecCodes: PrimeDropdownItem<string>[] = [
      { label: "ALL", value: null },
    ];
    if (newClassCode) {
      const securities: Security[] = getSecuritiesByClassCode(newClassCode);
      for (const sec of securities) {
        newSecCodes.push({ label: sec.secCode, value: sec.secCode });
      }
    } else {
      setSecCode(null);
    }
    setClassCode(newClassCode);
    setSecCodes(newSecCodes);
    setSecCode(null);
    setFilteredAlerts(alerts, newClassCode, null, interval, start);
  };

  const onSecCodeChanged = (newSecCode: string) => {
    console.log(newSecCode);
    setSecCode(newSecCode);
    setFilteredAlerts(alerts, classCode, newSecCode, interval, start);
  };

  const onStartDateChanged = (newStart: Date) => {
    console.log(newStart);
    setStart(newStart);
    setFilteredAlerts(alerts, classCode, secCode, interval, newStart);
  };

  const setFilteredAlerts = (
    alerts: PatternResult[],
    newClassCode: ClassCode,
    newSecCode: string,
    newInterval: Interval,
    newStart: Date
  ) => {
    let filtered = alerts;
    if (newClassCode) {
      filtered = filtered.filter((value) => value.classCode === newClassCode);
    }
    if (newSecCode) {
      filtered = filtered.filter((value) => value.candle.symbol === newSecCode);
    }
    if (newInterval) {
      filtered = filtered.filter((value) => value.interval === newInterval);
    }
    if (newStart) {
      filtered = filtered.filter(
        (value) => newStart.getTime() <= value.candle.timestamp.getTime()
      );
    }

    setVisibleAlerts(filtered);
  };

  const Row = ({ index, style }) => {
    const alert = visibleAlerts[index];

    return (
      <div
        key={alert.name + alert.interval + alert.candle.timestamp}
        className={`Alerts_item ${
          selectedAlert === alert ? "Alerts_item_selected" : ""
        } ${index % 2 ? "Alerts_item_odd" : "Alerts_item_even"}`}
        style={style}
        onClick={() => {
          setSelectedAlert(alert);
          onAlertSelected(alert);
        }}
      >
        <div className="alerts-row">
          <div className="alerts-cell alerts-time">{timeTemplate(alert)}</div>
          <div className="alerts-cell alerts-name">{nameTemplate(alert)}</div>
          <div
            className="alerts-cell alerts-symbol"
            title={alert.candle.symbol}
          >
            {alert.candle.symbol.substr(0, 8)}
          </div>
          {/*<div className="alerts-cell alerts-strength">
                        {strengthTemplate(alert)}
                    </div>*/}
          <div className="alerts-cell alerts-confirm">
            {confirmTemplate(alert)}
          </div>
          <div className="alerts-cell alerts-direction">
            {possibleFutureDirectionUpTemplate(alert)}
          </div>
        </div>
        <div className="alerts-cell alerts-description">
          {descriptionTemplate(alert)}
        </div>
      </div>
    );
  };

  return (
    <div className="p-grid alerts" style={{ height: alertsHeight || 200 }}>
      <div className="p-col-12 alerts-head">
        <div className="alerts-head-dropdown alerts-head-class-code">
          <Dropdown
            value={classCode}
            options={classCodes}
            onChange={(e) => {
              onClassCodeChanged(e.value);
            }}
          />
        </div>
        <div className="alerts-head-dropdown alerts-head-security">
          <Dropdown
            value={secCode}
            options={secCodes}
            onChange={(e) => {
              onSecCodeChanged(e.value);
            }}
          />
        </div>
        <div className="alerts-head-dropdown alerts-head-interval">
          <Dropdown
            value={interval}
            options={intervals}
            onChange={(e) => {
              onIntervalChanged(e.value);
            }}
          />
        </div>
        <div className="alerts-head-start-date">
          <Calendar
            value={start}
            onChange={(e) => onStartDateChanged(e.value as Date)}
          />
        </div>
      </div>
      <div
        className="p-col-12 alerts-body"
        style={{ height: (alertsHeight || 200) - 20 }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="List"
              height={height}
              itemCount={visibleAlerts.length}
              itemSize={60}
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

const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.security?.id === nextProps.security?.id &&
    prevProps.filter?.secId === nextProps.filter?.secId
  );
};

export default memo(Alerts, areEqual);
