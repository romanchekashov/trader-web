import * as React from "react";
import { useEffect, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import { BsNewspaper, BsCalendar } from "react-icons/bs";
import "./WidgetbarPages.css";
import { Tooltip } from "primereact/tooltip";
import { WidgetbarItem } from "../WidgetbarItem";
import { StockEventsBrief } from "../../share-event/StockEventsBrief";
import { SecurityLastInfo } from "../../../data/security/SecurityLastInfo";
import { SecurityLastInfoView } from "../../../../features/trading-charts/security/info/SecurityLastInfoView";

enum VisibleType {
  HIDE = "HIDE",
  VISIBLE = "VISIBLE",
  VISIBLE_PART = "VISIBLE_PART",
}

type Props = {
  item: WidgetbarItem | undefined;
  security: SecurityLastInfo | undefined;
};

const WidgetbarPages: React.FC<Props> = ({ item, security }) => {
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
    <div className="WidgetbarPages">
      <div>{item}</div>
      {security && item === WidgetbarItem.NEWS ? (
        <StockEventsBrief secCode={security.secCode} height={600} />
      ) : null}
      {security && item === WidgetbarItem.SEC_DATA ? (
        <SecurityLastInfoView security={security} />
      ) : null}
    </div>
  );
};

export default WidgetbarPages;
