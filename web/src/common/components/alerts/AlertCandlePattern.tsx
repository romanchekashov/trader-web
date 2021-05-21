import * as React from "react";
import { memo } from "react";
import { PatternName } from "./data/PatternName";
import { PatternResult } from "./data/PatternResult";
import "./styles/Alerts.css";
import "./styles/CandlePattern.css";
import moment = require("moment");
import { IntervalShortName } from "../../utils/utils";

type Props = {
  alert: PatternResult;
  className?: string;
};

const AlertCandlePattern: React.FC<Props> = ({ alert, className }) => {
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

  return (
    <>
      <div className="alerts-row">
        <div className="alerts-cell alerts-time">{timeTemplate(alert)}</div>
        <div className="alerts-cell alerts-name">{nameTemplate(alert)}</div>
        <div className="alerts-cell alerts-symbol" title={alert.candle.symbol}>
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
        <div className="alerts-cell alerts-direction">
          {IntervalShortName[alert.interval] || alert.interval}
        </div>
      </div>
      <div className="alerts-cell alerts-description">
        {descriptionTemplate(alert)}
      </div>
    </>
  );
};

export default memo(AlertCandlePattern);
