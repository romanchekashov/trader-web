import * as React from "react";
import { memo } from "react";
import { PatternName } from "../alerts/data/PatternName";
import { NotificationDto } from "./data/NotificationDto";
import "./styles/Notifications.css";
import "./styles/Signals.css";
import moment = require("moment");
import { DataType } from "../../data/DataType";
import NotificationPossibleTrade from "./NotificationPossibleTrade";
import { ClassCodeToSecTypeMap } from "../../utils/utils";

type Props = {
  alert: NotificationDto;
  className?: string;
};

const Notification: React.FC<Props> = ({ alert, className }) => {
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

  const descriptionTemplate = (dto: NotificationDto): any => {
    let index = dto.text.indexOf("[");
    let description = index !== -1 ? dto.text.substr(index) : dto.text;
    description = description.replace("CANDLE_PATTERN - ", "");
    description = description.split("Interval")[0];

    // return <div title={dto.text}>{description}</div>
    return '<div title="' + dto.text + '">' + description + "</div>";
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

  return (
    <div className={className}>
      <div className="notifications-title">
        <div
          className="notifications-cell notifications-symbol"
          title={alert.code}
        >
          <span className="notifications-symbol_secType">
            {ClassCodeToSecTypeMap[alert.classCode]}
          </span>{" "}
          {alert.code?.substr(0, 8)}
        </div>

        <div className="notifications-cell notifications-name">
          {nameTemplate(alert)}
        </div>

        <div className="notifications-cell notifications-time">
          {timeTemplate(alert)}
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
      <div style={{ padding: 5 }}>
        {alert.dataType === DataType.POSSIBLE_TRADE && alert.data ? (
          <NotificationPossibleTrade possibleTrade={alert.data} />
        ) : (
          <div
            className="notifications-cell notifications-description"
            dangerouslySetInnerHTML={{ __html: descriptionTemplate(alert) }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default memo(Notification);
