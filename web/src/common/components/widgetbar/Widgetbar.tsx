import * as React from "react";
import { useEffect, useState } from "react";
import { ToggleButton } from "primereact/togglebutton";
import WidgetbarTabs from "./WidgetbarTabs/WidgetbarTabs";
import "./Widgetbar.css";
import WidgetbarPages from "./WidgetbarPages/WidgetbarPages";
import { WidgetbarItem } from "./WidgetbarItem";
import { SecurityLastInfo } from "../../data/security/SecurityLastInfo";
import { SubscriptionLike } from "rxjs";
import { StackEvent, StackService } from "../stack/StackService";

enum VisibleType {
  HIDE = "HIDE",
  VISIBLE = "VISIBLE",
  VISIBLE_PART = "VISIBLE_PART",
}

const Widgetbar: React.FC = () => {
  const [item, setItem] = useState<WidgetbarItem>();
  const [security, setSecurity] = useState<SecurityLastInfo>();

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

  useEffect(() => {
    const stackEventsListener: SubscriptionLike = StackService.getInstance()
      .on<SecurityLastInfo>(StackEvent.SECURITY_SELECTED)
      .subscribe(setSecurity);

    return () => {
      stackEventsListener.unsubscribe();
    };
  }, []);

  const toggleView = (toggle: boolean) => {
    setVisible(!toggle ? VisibleType.VISIBLE : VisibleType.HIDE);
  };

  const toggleViewPart = (toggle: boolean) => {
    setVisible(!toggle ? VisibleType.VISIBLE_PART : VisibleType.HIDE);
  };

  const style = item
    ? {
        width: "300px",
        paddingRight: 0,
      }
    : {
        width: "50px",
        paddingLeft: 0,
      };

  return (
    <div className={`p-col-fixed Widgetbar`} style={style}>
      {item ? <WidgetbarPages item={item} security={security} /> : null}
      <WidgetbarTabs item={item} onItemSelected={setItem} />
    </div>
  );
};

export default Widgetbar;
