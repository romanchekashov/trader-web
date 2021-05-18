import * as React from "react";
import { EconomicCalendarEvent } from "../../../data/news/EconomicCalendarEvent";
import "./EconomicCalendarWidgetItem.css";
import moment = require("moment");
import { memo } from "react";
import { ExpectedVolatility } from "../../../data/news/ExpectedVolatility";

type Props = {
  event: EconomicCalendarEvent;
  onClick: (event: EconomicCalendarEvent) => void;
};

const EconomicCalendarWidgetItem: React.FC<Props> = ({ event, onClick }) => {
  const {
    country,
    currency,
    expectedVolatility,
    title,
    eventType,
    valueActual,
    valueForecast,
    valuePrevious,
    valuePreviousRevised,
    dateTime,
  } = event;

  let dotClassName = "";
  if (moment().isAfter(dateTime)) {
    dotClassName = "dot_old";
  } else if (moment(dateTime).diff(moment(), "minutes") < 30) {
    dotClassName = "dot_next";
  }

  const className = "ceFlags " + country.replace(" ", "_");

  return (
    <div className="EconomicCalendarWidgetItem" onClick={onClick.bind(event)}>
      <div className="EconomicCalendarWidgetItem_left">
        <div>
          {moment(dateTime).format("HH:mm")}{" "}
          <span className={`dot ${dotClassName}`}></span>
        </div>
        <div>
          <div>
            <span className={className} title={country}></span> {currency}
          </div>
          <div>
            {expectedVolatility === ExpectedVolatility.High ? (
              <div>
                <i className="newSiteIconsSprite grayFullBullishIcon"></i>
                <i className="newSiteIconsSprite grayFullBullishIcon"></i>
                <i className="newSiteIconsSprite grayFullBullishIcon"></i>
              </div>
            ) : expectedVolatility === ExpectedVolatility.Low ? (
              <div>
                <i className="newSiteIconsSprite grayFullBullishIcon"></i>
                <i className="newSiteIconsSprite grayEmptyBullishIcon"></i>
                <i className="newSiteIconsSprite grayEmptyBullishIcon"></i>
              </div>
            ) : (
              <div>
                <i className="newSiteIconsSprite grayFullBullishIcon"></i>
                <i className="newSiteIconsSprite grayFullBullishIcon"></i>
                <i className="newSiteIconsSprite grayEmptyBullishIcon"></i>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="EconomicCalendarWidgetItem_right">
        <div>
          {title}
          {eventType ? <span className="eventType">{eventType}</span> : null}
        </div>
        <div className="EconomicCalendarWidgetItem_values">
          <div style={{ paddingTop: "1px" }}>
            <span style={{ fontWeight: "bold" }}>{valueActual}</span>
          </div>
          <div style={{ paddingTop: "5%" }}>
            <span style={{ fontWeight: "bold" }}>{valueForecast}</span>
          </div>
          <div style={{ paddingTop: "1px" }}>
            <span style={{ fontWeight: "bold" }}>{valuePrevious}</span>
            {valuePreviousRevised ? (
              <span
                className="valuePreviousRevised"
                title={valuePreviousRevised}
              ></span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(EconomicCalendarWidgetItem);
