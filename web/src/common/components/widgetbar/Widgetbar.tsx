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

type Props = {
  width: number;
  onWidthChange: (width: number) => void;
};

const Widgetbar: React.FC<Props> = ({ width, onWidthChange }) => {
  const [item, setItem] = useState<WidgetbarItem>();
  const [security, setSecurity] = useState<SecurityLastInfo>();

  useEffect(() => {
    const stackEventsListener: SubscriptionLike = StackService.getInstance()
      .on<SecurityLastInfo>(StackEvent.SECURITY_SELECTED)
      .subscribe(setSecurity);

    return () => {
      stackEventsListener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    onWidthChange(item ? 300 : 50);
  }, [item]);

  const style = item
    ? {
        width,
        paddingRight: 0,
      }
    : {
        width,
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
