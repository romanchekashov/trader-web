import * as React from "react";
import { useEffect, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
const styles = require("./Widgetbar.module.css");

enum VisibleType {
  HIDE = "HIDE",
  VISIBLE = "VISIBLE",
  VISIBLE_PART = "VISIBLE_PART",
}

const WidgetbarTabs: React.FC = () => {
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

  return (
    <div>
      <div>
        <i className="pi pi-check" style={{ fontSize: "2em" }}></i>
      </div>
    </div>
  );
};

export default WidgetbarTabs;
