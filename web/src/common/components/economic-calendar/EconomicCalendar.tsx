import FullCalendar from "@fullcalendar/react";
import ruLocale from "@fullcalendar/core/locales/ru";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import * as React from "react";
import { useEffect, useState } from "react";
import newsApi from "../../../app/news/newsApi";
import { EconomicCalendarEvent } from "../../data/news/EconomicCalendarEvent";
import { DATE_FORMAT } from "../../utils/utils";
import "./EconomicCalendar.css";
import moment = require("moment");

type Props = {
  secId?: number;
  onEventSelected?: (event: EconomicCalendarEvent) => void;
};

class FullCalendarEvent<T> {
  title: string;
  start: Date;
  data: T;
}

export const EconomicCalendar: React.FC<Props> = ({
  secId,
  onEventSelected,
}) => {
  const [events, setEvents] = useState<
    FullCalendarEvent<EconomicCalendarEvent>[]
  >([]);
  const [selectedEvent, setSelectedEvent] =
    useState<EconomicCalendarEvent>(null);

  useEffect(() => {
    newsApi.getEconomicCalendarEvents(
      moment().subtract(1, "months").format(DATE_FORMAT),
      null,
      secId
    ).then((events) => {
      setEvents(
        events.map((value) => ({
          title: value.title,
          start: value.dateTime,
          data: value,
        }))
      );
    });

    // Specify how to clean up after this effect:
    return function cleanup() { };
  }, [secId]);

  const renderEventContent = (eventContent: any) => {
    const calEvent: EconomicCalendarEvent =
      eventContent.event.extendedProps.data;

    if (moment().isAfter(calEvent.dateTime)) {
      eventContent.backgroundColor = "#aaa";
    } else if (moment(calEvent.dateTime).diff(moment(), "minutes") < 30) {
      eventContent.backgroundColor = "#f00";
    }

    switch (eventContent.view.type) {
      case "listDay":
      case "listWeek":
      case "listMonth":
        return renderEventContentForListDay(calEvent);
    }

    return (
      <>
        <b>{eventContent.timeText}</b>
        <i>{eventContent.event.title}</i>
      </>
    );
  };

  const renderEventContentForListDay = (calEvent: EconomicCalendarEvent) => {
    const className = "ceFlags " + calEvent.country.replace(" ", "_");

    return (
      <div className="listDayEvent">
        <div>
          <span className={className} title={calEvent.country}></span>{" "}
          {calEvent.currency}
        </div>
        {calEvent.expectedVolatility === "High" ? (
          <div>
            <i className="newSiteIconsSprite grayFullBullishIcon"></i>
            <i className="newSiteIconsSprite grayFullBullishIcon"></i>
            <i className="newSiteIconsSprite grayFullBullishIcon"></i>
          </div>
        ) : calEvent.expectedVolatility === "Low" ? (
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
        <div>
          {calEvent.title}
          {calEvent.eventType ? (
            <span className="eventType">{calEvent.eventType}</span>
          ) : null}
        </div>
        <div>
          Actual:{" "}
          <span style={{ fontWeight: "bold" }}>{calEvent.valueActual}</span>
        </div>
        <div>
          Forecast:{" "}
          <span style={{ fontWeight: "bold" }}>{calEvent.valueForecast}</span>
        </div>
        <div>
          Previous:{" "}
          <span style={{ fontWeight: "bold" }}>{calEvent.valuePrevious}</span>
          {calEvent.valuePreviousRevised ? (
            <span
              className="valuePreviousRevised"
              title={calEvent.valuePreviousRevised}
            ></span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="p-grid">
      <div id="calendar" className="p-col-12">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
          ]}
          views={{
            listDay: { buttonText: "Дневная повестка" },
            listWeek: { buttonText: "Недельная повестка" },
            listMonth: { buttonText: "Месячная повестка" },
          }}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right:
              "dayGridMonth,timeGridWeek,timeGridDay,listDay,listWeek,listMonth",
          }}
          locales={[ruLocale]}
          locale="ru"
          initialView="listWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          events={events}
          eventContent={renderEventContent}
        />
      </div>
      <div className="p-col-12">
        <a
          href="http://sslecal2.forexprostools.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&category=_employment,_economicActivity,_inflation,_credit,_centralBanks,_confidenceIndex,_balance,_Bonds&features=datepicker,timezone,timeselector,filters&countries=25,32,4,17,39,72,14,48,26,10,6,37,7,21,43,56,52,36,5,22,12,11,35&calType=day&timeZone=18&lang=1"
          target="_blank"
        >
          Economic Calendar for Today on Investing.com
        </a>
      </div>
    </div>
  );
};
