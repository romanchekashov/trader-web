import * as React from "react";
import { useEffect, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import {
  BsClipboard,
  BsClipboardData,
  BsNewspaper,
  BsCalendar,
  BsAlarm,
  BsBell,
  BsChevronBarContract,
} from "react-icons/bs";
import "./WidgetbarTabs.css";
import { Tooltip } from "primereact/tooltip";
import { WidgetbarItem } from "../WidgetbarItem";

type Props = {
  item: WidgetbarItem | undefined;
  onItemSelected: (item: WidgetbarItem | undefined) => void;
};

const WidgetbarTabs: React.FC<Props> = ({ item, onItemSelected }) => {
  useEffect(() => {});

  const select = (newItem: WidgetbarItem) => {
    if (item === newItem) {
      onItemSelected(undefined);
    } else {
      onItemSelected(newItem);
    }
  };

  return (
    <div className={`WidgetbarTabs ${item ? "WidgetbarTabs_border" : ""}`}>
      <Tooltip target=".WidgetbarTab" />
      <div
        className={`WidgetbarTab ${
          item === WidgetbarItem.SECURITIES ? "active" : ""
        }`}
        data-pr-tooltip="Securities"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.SECURITIES)}
      >
        <BsClipboard />
      </div>
      <div
        className={`WidgetbarTab ${
          item === WidgetbarItem.SEC_DATA ? "active" : ""
        }`}
        data-pr-tooltip="Security Data"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.SEC_DATA)}
      >
        <BsClipboardData />
      </div>
      <div
        className={`WidgetbarTab ${
          item === WidgetbarItem.NEWS ? "active" : ""
        }`}
        data-pr-tooltip="News"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.NEWS)}
      >
        <BsNewspaper />
      </div>
      <div
        className={`WidgetbarTab ${
          item === WidgetbarItem.CALENDAR ? "active" : ""
        }`}
        data-pr-tooltip="Calendar"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.CALENDAR)}
      >
        <BsCalendar />
      </div>
      <div
        className={`WidgetbarTab ${
          item === WidgetbarItem.ALARMS ? "active" : ""
        }`}
        data-pr-tooltip="Alarms"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.ALARMS)}
      >
        <BsAlarm />
      </div>
      <div
        className={`WidgetbarTab ${
          item === WidgetbarItem.NOTIFICATIONS ? "active" : ""
        }`}
        data-pr-tooltip="Notifications"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.NOTIFICATIONS)}
      >
        <BsBell />
      </div>
      <div
        className={`WidgetbarTab ${
          item === WidgetbarItem.CONTROL_PANEL ? "active" : ""
        }`}
        data-pr-tooltip="Control Panel"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.CONTROL_PANEL)}
      >
        <BsChevronBarContract />
      </div>
    </div>
  );
};

export default WidgetbarTabs;
