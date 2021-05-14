import * as React from "react";
import { useEffect, useState } from "react";
import { DATE_TIME_FORMAT } from "../../utils/utils";
import "./MarketWorkTime.css";
import moment = require("moment");

/**
 * https://stock-list.ru/vremya-raboty-birzh.html
 * @constructor
 */
const MarketWorkTime: React.FC<{}> = ({}) => {
  const CLOSED = "closed";
  const OPEN = "open";
  const [time, setTime] = useState(moment().format(DATE_TIME_FORMAT));
  const [moex, setMoex] = useState(CLOSED);
  const [nyse, setNyse] = useState(CLOSED);
  const [lse, setLse] = useState(CLOSED);
  const [hkse, setHkse] = useState(CLOSED);

  const isSummerTimeInUSA = (() => {
    const nyTime = moment().utcOffset(-480);
    const MAR = 2;
    const NOV = 10;
    if (nyTime.month() === MAR) {
      let secondSunday = nyTime.clone().date(7);
      while (secondSunday.day() !== 0) secondSunday.add(1, "day");
      return nyTime.date() >= secondSunday.date();
    }
    if (nyTime.month() === NOV) {
      let firstSunday = nyTime.clone().date(1);
      while (firstSunday.day() !== 0) firstSunday.add(1, "day");
      return nyTime.date() < firstSunday.date();
    }
    return nyTime.month() > MAR && nyTime.month() < NOV;
  })();

  const isSummerTimeInUK = (() => {
    const ukTime = moment().utcOffset(-180);
    const MAR = 2;
    const OCT = 9;
    if (ukTime.month() === MAR) {
      let secondSunday = ukTime.clone().date(21);
      while (secondSunday.day() !== 0) secondSunday.add(1, "day");
      return ukTime.date() >= secondSunday.date();
    }
    if (ukTime.month() === OCT) {
      let firstSunday = ukTime.clone().date(21);
      while (firstSunday.day() !== 0) firstSunday.add(1, "day");
      return ukTime.date() < firstSunday.date();
    }
    return ukTime.month() > MAR && ukTime.month() < OCT;
  })();

  const updateMoex = () => {
    const START_IN_MINUTES = 10 * 60;
    const END_IN_MINUTES = 23 * 60 + 50;
    const FIRST_CLEAR_START_IN_MINUTES = 14 * 60;
    const FIRST_CLEAR_END_IN_MINUTES = 14 * 60 + 5;
    const SECOND_CLEAR_START_IN_MINUTES = 18 * 60 + 45;
    const SECOND_CLEAR_END_IN_MINUTES = 19 * 60;
    const _time = moment();
    const timeInMinutes = _time.hours() * 60 + _time.minutes();
    const timeDay = _time.day();
    if (timeDay === 0 || timeDay === 6) {
      setMoex(CLOSED);
    } else if (
      timeInMinutes < START_IN_MINUTES ||
      timeInMinutes > END_IN_MINUTES
    ) {
      setMoex(CLOSED);
    } else if (
      timeInMinutes >= FIRST_CLEAR_START_IN_MINUTES &&
      timeInMinutes <= FIRST_CLEAR_END_IN_MINUTES
    ) {
      setMoex("mid clear");
    } else if (
      timeInMinutes >= SECOND_CLEAR_START_IN_MINUTES &&
      timeInMinutes <= SECOND_CLEAR_END_IN_MINUTES
    ) {
      setMoex("session clear");
    } else {
      setMoex(OPEN);
    }
  };

  const updateNewYorkAndChicagoStockExchange = () => {
    const START_IN_MINUTES = isSummerTimeInUSA ? 16 * 60 + 30 : 17 * 60 + 30;
    const END_IN_MINUTES = isSummerTimeInUSA ? 23 * 60 : 24 * 60;
    const _time = moment();
    const timeInMinutes = _time.hours() * 60 + _time.minutes();
    const timeDay = _time.day();
    if (
      timeDay > 0 &&
      timeDay < 6 &&
      timeInMinutes >= START_IN_MINUTES &&
      timeInMinutes <= END_IN_MINUTES
    ) {
      setNyse(OPEN);
    } else {
      setNyse(CLOSED);
    }
  };

  const updateLondonStockExchange = () => {
    const START_IN_MINUTES = isSummerTimeInUK ? 10 * 60 : 11 * 60;
    const END_IN_MINUTES = isSummerTimeInUK ? 18 * 60 + 30 : 19 * 60 + 30;
    const _time = moment();
    const timeInMinutes = _time.hours() * 60 + _time.minutes();
    const timeDay = _time.day();
    if (
      timeDay > 0 &&
      timeDay < 6 &&
      timeInMinutes >= START_IN_MINUTES &&
      timeInMinutes <= END_IN_MINUTES
    ) {
      setLse(OPEN);
    } else {
      setLse(CLOSED);
    }
  };

  const updateHongKongStockExchange = () => {
    const START_IN_MINUTES = 5 * 60;
    const END_IN_MINUTES = 11 * 60;
    const _time = moment();
    const timeInMinutes = _time.hours() * 60 + _time.minutes();
    const timeDay = _time.day();
    if (
      timeDay > 0 &&
      timeDay < 6 &&
      timeInMinutes >= START_IN_MINUTES &&
      timeInMinutes <= END_IN_MINUTES
    ) {
      setHkse(OPEN);
    } else {
      setHkse(CLOSED);
    }
  };

  const update = () => {
    setTime(moment().format(DATE_TIME_FORMAT));
    updateMoex();
    updateNewYorkAndChicagoStockExchange();
    updateLondonStockExchange();
    updateHongKongStockExchange();
  };

  useEffect(() => {
    const interval = setInterval(update, 1000);
    return () => {
      clearInterval(interval);
    };
  });

  return (
    <div className="market-work-time">
      <div style={{ marginLeft: "5px", display: "flex" }}>
        <div className="ceFlags rus market-work-time-flag"></div>
        <i className={"pi pi-clock market-work-time-" + moex}></i>
      </div>
      <div style={{ marginLeft: "5px", display: "flex" }}>
        <div className="ceFlags UK market-work-time-flag"></div>
        <i className={"pi pi-clock market-work-time-" + lse}></i>
      </div>
      <div style={{ marginLeft: "5px", display: "flex" }}>
        <div className="ceFlags usa market-work-time-flag"></div>
        <i className={"pi pi-clock market-work-time-" + nyse}></i>
      </div>
      <div style={{ marginLeft: "5px", display: "flex" }}>
        <div className="ceFlags hkd market-work-time-flag"></div>
        <i className={"pi pi-clock market-work-time-" + hkse}></i>
      </div>
      <div style={{ marginLeft: "5px", marginRight: "5px", display: "flex" }}>
        {time}
      </div>
    </div>
  );
};

export default MarketWorkTime;
