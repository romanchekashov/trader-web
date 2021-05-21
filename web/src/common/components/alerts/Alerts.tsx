import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import * as React from "react";
import { memo, useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  loadSignals,
  selectSignals,
} from "../../../app/notifications/notificationsSlice";
import { selectSecurities } from "../../../app/securities/securitiesSlice";
import { WebsocketService, WSEvent } from "../../api/WebsocketService";
import { playSound } from "../../assets/assets";
import { ClassCode } from "../../data/ClassCode";
import { FilterDto } from "../../data/FilterDto";
import { Interval } from "../../data/Interval";
import { Security } from "../../data/security/Security";
import { Signal } from "../../data/Signal";
import {
  ClassCodeToSecTypeMap,
  Intervals,
  PrimeDropdownItem,
} from "../../utils/utils";
import AlertCandlePattern from "./AlertCandlePattern";
import AlertSignal from "./AlertSignal";
import { PatternResult } from "./data/PatternResult";
import "./styles/Alerts.css";
import "./styles/CandlePattern.css";
import moment = require("moment");

interface DataWrapper {
  alert?: PatternResult;
  signal?: Signal;
}

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
  alertsHeight = 200,
}) => {
  const dispatch = useAppDispatch();
  const { shares, currencies, futures } = useAppSelector(selectSecurities);
  const { signals, newSignals } = useAppSelector(selectSignals);

  const [interval, setInterval] = useState(null);
  const [classCode, setClassCode] = useState(null);
  const [secCode, setSecCode] = useState(null);
  const [start, setStart] = useState(
    moment().hours(0).minutes(0).seconds(0).toDate()
  );

  const [visibleAlerts, setVisibleAlerts] = useState<PatternResult[]>([]);
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

  useEffect(() => {
    if (signals.length) {
      setAlertsReceivedFromServer(
        signals,
        security?.classCode,
        security?.code,
        null,
        start
      );
      setFetchAlertsError(null);
    }
  }, [signals]);

  useEffect(() => {
    let alertsSubscription;
    if (filter) {
      fetchAlertsAttempt = 0;

      // onClassCodeChanged(filter.classCode);
      // onSecCodeChanged(filter.secCode);
      onIntervalChanged(null);
      dispatch(loadSignals(filter));

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
  }, [filter]);

  const notifyOnNewAlert = (newAlerts: PatternResult[]): void => {
    if (newAlerts && newAlerts.length !== previousAlertsCount) {
      playSound(4);
      previousAlertsCount = newAlerts.length;
    }
  };

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

  const getSecuritiesByClassCode = (classCode: ClassCode): Security[] => {
    switch (classCode) {
      case ClassCode.SPBFUT:
        return futures;
      case ClassCode.TQBR:
        return shares;
      case ClassCode.CETS:
        return currencies;
    }
  };

  const getSecCodes = (classCode: ClassCode): PrimeDropdownItem<string>[] => {
    const secCodes: PrimeDropdownItem<string>[] = [
      { label: "ALL", value: null },
    ];

    if (classCode) {
      const securities: Security[] = getSecuritiesByClassCode(classCode);
      for (const sec of securities) {
        if (newSignals && !newSignals.has(sec.id)) continue;

        secCodes.push({ label: sec.secCode, value: sec.secCode });
      }
    }

    return secCodes;
  };

  const secCodes = getSecCodes(classCode);

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

  let combinedAlerts: DataWrapper[] = [];

  if (visibleAlerts.length) {
    for (const alert of visibleAlerts) {
      if (alert.candle.timestamp.getTime() < start.getTime()) continue;
      if (classCode && classCode !== alert.classCode) continue;
      if (secCode && secCode !== alert.candle.symbol) continue;
      if (interval && interval !== alert.interval) continue;

      combinedAlerts.push({ alert });
    }
  }

  if (newSignals) {
    newSignals.forEach((val, key) => {
      for (const signal of val) {
        if (signal.timestamp.getTime() < start.getTime()) continue;
        if (
          classCode &&
          ClassCodeToSecTypeMap[classCode] !== signal.securityType
        )
          continue;
        if (secCode && secCode !== signal.ticker) continue;
        if (interval && interval !== signal.interval) continue;

        combinedAlerts.push({ signal });
      }
    });
  }

  combinedAlerts.sort((a, b) => {
    const datetime1 = a.alert?.candle.timestamp || a.signal?.timestamp;
    const datetime2 = b.alert?.candle.timestamp || b.signal?.timestamp;
    return datetime2.getTime() - datetime1.getTime();
  });

  const Row = ({ index, style }) => {
    const { alert, signal } = combinedAlerts[index];
    let key = "";
    let isSelected = false;

    if (alert) {
      key = alert.name + alert.interval + alert.candle.timestamp;
      isSelected = selectedAlert === alert;
    }

    if (signal) {
      key = signal.secId + signal.interval + signal.name + signal.timestamp;
    }

    return (
      <div
        key={key}
        className={`Alerts_item ${isSelected ? "Alerts_item_selected" : ""} ${
          index % 2 ? "Alerts_item_odd" : "Alerts_item_even"
        }`}
        style={style}
        onClick={() => {
          setSelectedAlert(alert);
          onAlertSelected(alert);
        }}
      >
        {alert ? <AlertCandlePattern alert={alert} /> : null}
        {signal ? <AlertSignal alert={signal} /> : null}
      </div>
    );
  };

  return (
    <div className="p-grid alerts" style={{ height: alertsHeight }}>
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
        style={{ height: alertsHeight - 47 }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              className="List"
              height={height}
              itemCount={combinedAlerts.length}
              itemSize={80}
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
    (!prevProps.filter && !nextProps.filter) ||
    (prevProps.filter &&
      nextProps.filter &&
      prevProps.filter?.secId === nextProps.filter?.secId)
  );
};

export default memo(Alerts, areEqual);
