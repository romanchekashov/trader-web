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
  setSignals,
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
  getRecentBusinessDate,
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
  onAlertSelected: (alert: any) => void;
  alertsHeight?: number;
};

let previousAlertsCount = 0;

const Alerts: React.FC<Props> = ({
  filter,
  onAlertSelected,
  alertsHeight = 200,
}) => {
  const dispatch = useAppDispatch();
  const { shares, currencies, futures } = useAppSelector(selectSecurities);
  const { signals, newSignals, signalsLoadingError } =
    useAppSelector(selectSignals);

  const [selectedAlert, setSelectedAlert] = useState<DataWrapper>(null);

  const [interval, setInterval] = useState(null);
  const [classCode, setClassCode] = useState(null);
  const [secCode, setSecCode] = useState<number>(null);
  const [start, setStart] = useState(
    getRecentBusinessDate(moment().hours(0).minutes(0).seconds(0).toDate())
  );

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
    let alertsSubscription;
    if (filter) {
      setClassCode(null);
      setSecCode(filter?.secId);
      setInterval(null);
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

            dispatch(setSignals(newAlerts));
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

  const getSecCodes = (classCode: ClassCode): PrimeDropdownItem<number>[] => {
    const secCodes: PrimeDropdownItem<number>[] = [
      { label: "ALL", value: null },
    ];

    if (classCode) {
      const securities: Security[] = getSecuritiesByClassCode(classCode);
      for (const sec of securities) {
        if (newSignals && !newSignals.has(sec.id)) continue;

        secCodes.push({ label: sec.secCode, value: sec.id });
      }
    }

    return secCodes;
  };

  const secCodes = getSecCodes(classCode);

  const onClassCodeChanged = (newClassCode: ClassCode) => {
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
  };

  let combinedAlerts: DataWrapper[] = [];

  if (signals.length) {
    for (const alert of signals) {
      if (alert.candle.timestamp.getTime() < start.getTime()) continue;
      if (classCode && classCode !== alert.classCode) continue;
      if (secCode && secCode !== alert.candle.secId) continue;
      if (interval && interval !== alert.interval) continue;

      combinedAlerts.push({ alert });
    }

    notifyOnNewAlert(signals);
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
        if (secCode && secCode !== signal.secId) continue;
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

  const getKey = (data: DataWrapper): string => {
    const { alert, signal } = data;
    if (alert) {
      return alert.name + alert.interval + alert.candle.timestamp;
    }

    if (signal) {
      return signal.secId + signal.interval + signal.name + signal.timestamp;
    }
  };

  const Row = ({ index, style }) => {
    const data: DataWrapper = combinedAlerts[index];
    const { alert, signal } = data;
    let key = getKey(data);
    let isSelected = selectedAlert && getKey(selectedAlert) === key;

    return (
      <div
        key={key}
        className={`Alerts_item ${isSelected ? "Alerts_item_selected" : ""} ${
          index % 2 ? "Alerts_item_odd" : "Alerts_item_even"
        }`}
        style={style}
        onClick={() => {
          setSelectedAlert(data);
          onAlertSelected(alert || signal);
        }}
      >
        {alert ? <AlertCandlePattern alert={alert} /> : null}
        {signal ? <AlertSignal alert={signal} /> : null}
      </div>
    );
  };

  if (!filter) {
    return <>Filter for alerts is not set.</>;
  }

  // if (filter && signalsLoadingError) {
  //   return <div style={{ color: "red" }}>{signalsLoadingError}</div>;
  // }

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
              setSecCode(e.value);
            }}
          />
        </div>
        <div className="alerts-head-dropdown alerts-head-interval">
          <Dropdown
            value={interval}
            options={intervals}
            onChange={(e) => {
              setInterval(e.value);
            }}
          />
        </div>
        <div className="alerts-head-start-date">
          <Calendar value={start} onChange={(e) => setStart(e.value as Date)} />
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
