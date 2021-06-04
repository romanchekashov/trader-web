import { Button } from "primereact/button";
import * as React from "react";
import { memo, useEffect, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { FixedSizeList as List } from "react-window";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { loadEconomicCalendarEvents, selectEconomicCalendarEvents } from "../../../../app/news/newsSlice";
import { EconomicCalendarEvent } from "../../../data/news/EconomicCalendarEvent";
import { DATE_FORMAT } from "../../../utils/utils";
import "./EconomicCalendarWidget.css";
import EconomicCalendarWidgetItem from "./EconomicCalendarWidgetItem";
import moment = require("moment");

export interface EventWrapper {
  id: number;
  title?: string;
  event?: EconomicCalendarEvent;
}

type Props = {
  secId?: number;
  onEventSelected?: (event: EconomicCalendarEvent) => void;
  viewHeight?: number;
};

const EconomicCalendarWidget: React.FC<Props> = ({
  secId,
  onEventSelected,
  viewHeight = 600,
}) => {
  const dispatch = useAppDispatch();
  const { economicCalendarEvents } = useAppSelector(selectEconomicCalendarEvents);
  
  const [selectedEvent, setSelectedEvent] =
    useState<EconomicCalendarEvent>(null);
  const listRef = useRef(null);

  useEffect(() => {
    scrollToNearestEvent();
  }, [economicCalendarEvents]);

  const eventWrappers: EventWrapper[] = [];
  let day;

  for (let i = 0; i < economicCalendarEvents.length; i++) {
    const event = economicCalendarEvents[i];

    if (day !== event.dateTime.getDate()) {
      eventWrappers.push({
        title: moment(event.dateTime).format("ddd, MMM D"),
        id: event.dateTime.getTime(),
      });
      day = event.dateTime.getDate();
    }

    eventWrappers.push({ event, id: event.id });
  }

  const scrollToNearestEvent = () => {
    listRef?.current?.scrollToItem(nearestEventIndex(eventWrappers), "center");
  };

  const nearestEventIndex = (eventWrappers: EventWrapper[]): number => {
    const currentMoment = moment();
    let scrollToItemIdx = 0;

    eventWrappers.some(({ event }) => {
      scrollToItemIdx++;
      if (event) {
        const minutes = moment(event.dateTime).diff(currentMoment, "minutes");
        return minutes > -30;
      }
      return false;
    });

    return scrollToItemIdx;
  };

  const Row = ({ index, style }) => {
    const { id, title, event } = eventWrappers[index];
    // const className =
    //   "notifications-row " +
    //   (selectedAlert === alert ? "notifications-row-selected" : "");

    return (
      <div
        key={id}
        style={style}
        className={
          index % 2
            ? "notifications-list-item-odd"
            : "notifications-list-item-even"
        }
      >
        {event ? (
          <EconomicCalendarWidgetItem event={event} onClick={onEventSelected} />
        ) : (
          <div className="EconomicCalendarWidgetItem_group_title">
            <h2>{title}</h2>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-grid">
      <div className="EconomicCalendarWidget_head">
        <div>
          <h3 style={{ margin: "6px" }}>Economic calendar</h3>
        </div>
        <div>
          <Button
            label="Nearest Event"
            className="p-button-outlined p-button-sm"
            onClick={scrollToNearestEvent}
          />
        </div>
      </div>
      <div className="EconomicCalendarWidget_head">
        <div>Time</div>
        <div>Actual</div>
        <div>Forecast</div>
        <div>Previous</div>
      </div>
      <div
        className="p-col-12 notifications-body"
        style={{ height: viewHeight - 62 }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <List
              ref={listRef}
              className="notifications-list"
              height={height}
              itemCount={eventWrappers.length}
              itemSize={70}
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

export default memo(EconomicCalendarWidget);
