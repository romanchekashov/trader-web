import * as React from "react";
import { useEffect, useState } from "react";
import { useAppSelector } from "../../../app/hooks";
import { selectSecurities } from "../../../app/securities/securitiesSlice";
import "./Widgetbar.css";
import { WidgetbarItem } from "./WidgetbarItem";
import WidgetbarPages from "./WidgetbarPages/WidgetbarPages";
import WidgetbarTabs from "./WidgetbarTabs/WidgetbarTabs";

type Props = {
  width: number;
  onWidthChange: (width: number) => void;
};

const Widgetbar: React.FC<Props> = ({ width, onWidthChange }) => {
  const { security } = useAppSelector(selectSecurities);

  const [item, setItem] = useState<WidgetbarItem>();

  useEffect(() => {
    onWidthChange(item ? 350 : 50);
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
      <WidgetbarTabs item={item} security={security} onItemSelected={setItem} />
    </div>
  );
};

export default Widgetbar;
