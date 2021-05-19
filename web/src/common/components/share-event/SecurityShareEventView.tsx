import * as React from "react";
import { useEffect, useState } from "react";
import { getSecurityShareEvents } from "../../api/rest/analysisRestApi";
import { SecurityShareEvent } from "../../data/news/SecurityShareEvent";
import "./SecurityShareEventView.css";
import moment = require("moment");

type Props = {
  secCode: string;
};

export const SecurityShareEventView: React.FC<Props> = ({ secCode }) => {
  const [events, setEvents] = useState<SecurityShareEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityShareEvent>(null);

  useEffect(() => {
    if (secCode) {
      getSecurityShareEvents(secCode).then((events) => {
        setEvents(events);
        if (events.length > 0) setSelectedEvent(events[0]);
      });
    }
  }, [secCode]);

  const formatEvent = (event: SecurityShareEvent) => {
    const date = moment(event.published).format("DD-MM-YYYY");
    const published = moment(event.published).format("DD-MM-YYYY HH:mm");

    return (
      <>
        <h3>
          {event.title} ({date})
        </h3>
        <p>
          Pub: {published} by {event.newsProvider}{" "}
          <a href={event.href} target="_blank">
            {event.href}
          </a>
        </p>
        <div dangerouslySetInnerHTML={{ __html: selectedEvent.htmlText }}></div>
      </>
    );
  };

  return (
    <div className="p-grid">
      <div
        className="p-col-4"
        style={{ padding: 0, height: 800, overflowY: "scroll" }}
      >
        {events.map((shareEvent, index) => {
          const date = moment(shareEvent.published).format("DD-MM-YYYY");
          const published = moment(shareEvent.published).format(
            "DD-MM-YYYY HH:mm"
          );
          const isSelected =
            selectedEvent &&
            shareEvent.title === selectedEvent.title &&
            shareEvent.published.getTime() ===
              selectedEvent.published.getTime();

          let className = "menu-item";
          if (isSelected) {
            className += " menu-item-selected";
          } else if (index % 2 === 0) {
            className += " menu-item-even";
          }

          return (
            <div
              key={shareEvent.published.getTime()}
              className={className}
              onClick={(e) => setSelectedEvent(shareEvent)}
            >
              <div className="menu-item-pub">
                Pub: {published} by {shareEvent.newsProvider}
              </div>
              <div className="menu-item-title">
                {shareEvent.title} ({date})
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="p-col-8"
        style={{ padding: 0, paddingLeft: 5, height: 800, overflowY: "scroll" }}
      >
        {selectedEvent ? formatEvent(selectedEvent) : null}
      </div>
    </div>
  );
};
