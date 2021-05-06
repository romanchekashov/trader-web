import * as React from "react";
import { useEffect, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import {
  BsNewspaper,
  BsCalendar,
  BsFileEarmarkSpreadsheet,
} from "react-icons/bs";
import "./WidgetbarTabs.css";
import { Tooltip } from "primereact/tooltip";
import { WidgetbarItem } from "../WidgetbarItem";

enum VisibleType {
  HIDE = "HIDE",
  VISIBLE = "VISIBLE",
  VISIBLE_PART = "VISIBLE_PART",
}

type Props = {
  item: WidgetbarItem | undefined;
  onItemSelected: (item: WidgetbarItem | undefined) => void;
};

const WidgetbarTabs: React.FC<Props> = ({ item, onItemSelected }) => {
  const ToggleVisibleType = {
    HIDE: -58,
    VISIBLE: -60,
    VISIBLE_PART: -58,
  };

  const VisibleTypeViewTop = {
    HIDE: -260,
    VISIBLE: 0,
    VISIBLE_PART: -100,
  };

  const [visible, setVisible] = useState(VisibleType.HIDE);

  useEffect(() => {});

  const toggleView = (toggle: boolean) => {
    setVisible(!toggle ? VisibleType.VISIBLE : VisibleType.HIDE);
  };

  const toggleViewPart = (toggle: boolean) => {
    setVisible(!toggle ? VisibleType.VISIBLE_PART : VisibleType.HIDE);
  };

  const select = (newItem: WidgetbarItem) => {
    if (item === newItem) {
      onItemSelected(undefined);
    } else {
      onItemSelected(newItem);
    }
  };

  return (
    <div className="WidgetbarTabs">
      <Tooltip target=".WidgetbarTab" />
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
          item === WidgetbarItem.SEC_DATA ? "active" : ""
        }`}
        data-pr-tooltip="Security Data"
        data-pr-position="left"
        onClick={() => select(WidgetbarItem.SEC_DATA)}
      >
        <BsFileEarmarkSpreadsheet />
      </div>
    </div>
  );
};

export default WidgetbarTabs;
