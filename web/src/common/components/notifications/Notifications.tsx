import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import * as React from "react";
import { memo, useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  loadNotifications,
  selectNotifications
} from "../../../app/notifications/notificationsSlice";
import { selectSecurities } from "../../../app/securities/securitiesSlice";
import { WebsocketService, WSEvent } from "../../api/WebsocketService";
import { playSound } from "../../assets/assets";
import { ClassCode } from "../../data/ClassCode";
import { FilterDto } from "../../data/FilterDto";
import { Interval } from "../../data/Interval";
import { Security } from "../../data/security/Security";
import {
  DATE_TIME_FORMAT,
  getRecentBusinessDate,
  Intervals,
  PrimeDropdownItem
} from "../../utils/utils";
import { NotificationDto } from "./data/NotificationDto";
import Notification from "./Notification";
import "./styles/Notifications.css";
import "./styles/Signals.css";
import moment = require("moment");

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
  viewHeight = 200,
  itemSize,
}) => {
  const dispatch = useAppDispatch();
  const { shares, currencies, futures } = useAppSelector(selectSecurities);
  const { notifications } = useAppSelector(selectNotifications);

  const [lastTimeUpdate, setLastTimeUpdate] = useState<string>();
  const [interval, setInterval] = useState(null);
  const [classCode, setClassCode] = useState(null);
  const [secCode, setSecCode] = useState(null);
  const [start, setStart] = useState<Date>(
    getRecentBusinessDate(
      moment().subtract(1, "days").hours(0).minutes(0).seconds(0).toDate()
    )
  );
  const [textPattern, setTextPattern] = useState("");

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

  useEffect(() => {
    if (notifications.length) {
      setAlertsReceivedFromServer(
        notifications,
        security?.classCode,
        security?.code,
        null,
        start,
        ""
      );
      setFetchAlertsError(null);
    }
  }, [notifications]);

  useEffect(() => {
    let alertsSubscription;
    let wsStatusSub;

    if (filter) {
      fetchAlertsAttempt = 0;

      // onClassCodeChanged(filter.classCode);
      // onSecCodeChanged(filter.secCode);
      onIntervalChanged(null);
      onTextPatternChanged("");
      dispatch(loadNotifications(filter));

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
      }
    }

    // Specify how to clean up after this effect:
    return function cleanup() {
      if (alertsSubscription) alertsSubscription.unsubscribe();
      if (wsStatusSub) wsStatusSub.unsubscribe();
    };
  }, [filter]);

  useEffect(() => {
    setClassCode(security?.classCode);
  }, [security?.id]);

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
        secCodes.push({ label: sec.code, value: sec.code });
      }
    }

    return secCodes;
  };

  const secCodes = getSecCodes(classCode);

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

  const setAlertsReceivedFromServer = (
    newAlerts: NotificationDto[],
    newClassCode: ClassCode | undefined,
    newSecCode: string | undefined,
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
    setLastTimeUpdate(moment(new Date()).format(DATE_TIME_FORMAT));
  };

  if (!filter) {
    return <>Filter for notifications is not set.</>;
  }

  if (filter && fetchAlertsError) {
    return <div style={{ color: "red" }}>{fetchAlertsError}</div>;
  }

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
    setClassCode(newClassCode);
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
        key={alert.title + alert.timeInterval + alert.created}
        className={
          index % 2
            ? "notifications-list-item-odd"
            : "notifications-list-item-even"
        }
        style={style}
        onClick={() => {
          setSelectedAlert(alert);
          onNotificationSelected(alert);
        }}
      >
        <Notification alert={alert} className={className} />
      </div>
    );
  };

  return (
    <div className="p-grid notifications" style={{ height: viewHeight }}>
      <div className="p-col-12 notifications-head">
        <div className="notifications-head-dropdown notifications-head-class-code">
          <Dropdown
            value={classCode}
            options={classCodes}
            onChange={(e) => {
              onClassCodeChanged(e.value);
            }}
          />
        </div>
        <div className="notifications-head-dropdown notifications-head-security">
          <Dropdown
            value={secCode}
            options={secCodes}
            onChange={(e) => {
              onSecCodeChanged(e.value);
            }}
          />
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
        <div className="notifications-head-start-date">{lastTimeUpdate}</div>
      </div>
      <div
        className="p-col-12 notifications-body"
        style={{ height: viewHeight - 38 }}
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
