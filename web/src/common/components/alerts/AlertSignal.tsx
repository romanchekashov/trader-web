import * as React from "react";
import { memo } from "react";
import { Signal } from "../../data/Signal";
import { PatternName } from "./data/PatternName";
import "./styles/Alerts.css";
import "./styles/CandlePattern.css";
import moment = require("moment");
import { IntervalShortName } from "../../utils/utils";

type Props = {
  alert: Signal;
  className?: string;
};

const AlertSignal: React.FC<Props> = ({ alert, className }) => {
  const timeTemplate = (alert: Signal) => {
    return <>{moment(alert.timestamp).format("HH:mm/DD MMM YY")}</>;
  };

  const getCandlePatternClassName = (alert: Signal) => {
    let className = "";
    const name = alert.name.split("-")[1];
    const sInterval = alert.interval.toString();

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

  const nameTemplate = (signal: Signal) => {
    let className = "alert-icon ";
    const sInterval = signal.interval.toString();
    const title = `${signal.price} - ${
      signal.name
    } - Interval: ${sInterval} - ${moment(signal.timestamp).format(
      "HH:mm DD-MM-YYYY"
    )}`;
    const sArr = signal.name.split("-");

    if (sArr.length > 1) {
      if ("CANDLE_PATTERN" === sArr[0]) {
        className += getCandlePatternClassName(signal);
      } else if ("PRICE_CLOSE_TO_SR_LEVEL" === sArr[0]) {
        const cls = signal.name.replace(
          "PRICE_CLOSE_TO_SR_LEVEL",
          "sr_level_cross"
        );
        className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
      } else if ("PRICE_CLOSE_TO_TREND_LINE" === sArr[0]) {
        const cls = signal.name.replace(
          "PRICE_CLOSE_TO_TREND_LINE",
          "trend_line_cross"
        );
        className += cls.toLowerCase() + "-" + sInterval.toLowerCase();
      } else if ("SR_ZONE_CROSS" === sArr[0]) {
        className += signal.name.toLowerCase();
      } else {
        className += signal.name.toLowerCase() + "-" + sInterval.toLowerCase();
      }
    }

    return (
      <div
        key={signal.securityType + signal.ticker + signal.price + title}
        className={className}
        title={signal.description}
      ></div>
    );
  };

  // const confirmTemplate = (alert: Signal) => {
  //   const className = alert.hasConfirmation ? "confirm" : "";
  //   return <div className={className}></div>;
  // };

  // const possibleFutureDirectionUpTemplate = (alert: Signal) => {
  //   const className = alert.possibleFutureDirectionUp
  //     ? "direction-up"
  //     : "direction-down";
  //   return <div className={className}></div>;
  // };

  const strengthTemplate = (alert: Signal) => {
    const className =
      "strength-icon strength-" + alert.strength.toString().toLowerCase();
    return <div className={className} title={alert.strength}></div>;
  };

  const descriptionTemplate = (alert: Signal) => {
    const { description } = alert;
    return (
      <div
        title={description}
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      ></div>
    );
  };

  return (
    <>
      <div className="alerts-row">
        <div className="alerts-cell alerts-time">{timeTemplate(alert)}</div>
        <div className="alerts-cell alerts-name">{nameTemplate(alert)}</div>
        <div className="alerts-cell alerts-symbol">
          {alert.ticker}({alert.secId})
        </div>
        {/*<div className="alerts-cell alerts-strength">
                        {strengthTemplate(alert)}
                    </div>*/}
        <div className="alerts-cell alerts-confirm">
          {/* {confirmTemplate(alert)} */}
        </div>
        <div className="alerts-cell alerts-direction">
          {/* {possibleFutureDirectionUpTemplate(alert)} */}
          {IntervalShortName[alert.interval] || alert.interval}
        </div>
      </div>
      <div className="alerts-cell alerts-description">
        {descriptionTemplate(alert)}
      </div>
    </>
  );
};

export default memo(AlertSignal);
